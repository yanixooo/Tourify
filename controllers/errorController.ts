import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import AppError from '../utils/appError.js';

interface MongoError extends Error {
  path?: string;
  value?: string;
  errmsg?: string;
  code?: number;
  errors?: Record<string, { message: string }>;
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

const handleCastErrorDB = (err: MongoError): AppError => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: MongoError): AppError => {
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0] || 'unknown';
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: MongoError): AppError => {
  const errors = Object.values(err.errors || {}).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = (): AppError =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = (): AppError =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err: MongoError, res: Response): void => {
  res.status(err.statusCode || 500).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: MongoError, res: Response): void => {
  // Operational, trusted Error: send message to the client
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak error details
    // Log Error
    console.error('Error!', err);

    // Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

const globalErrorHandler: ErrorRequestHandler = (
  err: MongoError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

export default globalErrorHandler;
