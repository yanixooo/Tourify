import { describe, it, expect } from 'vitest';
import AppError from './appError.js';

describe('AppError', () => {
  it('should create an error with message and status code', () => {
    const error = new AppError('Test error', 404);
    
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(404);
    expect(error.status).toBe('fail');
    expect(error.isOperational).toBe(true);
  });

  it('should set status to "error" for 500 status codes', () => {
    const error = new AppError('Server error', 500);
    
    expect(error.status).toBe('error');
  });

  it('should set status to "fail" for 4xx status codes', () => {
    const error = new AppError('Bad request', 400);
    expect(error.status).toBe('fail');
    
    const error2 = new AppError('Unauthorized', 401);
    expect(error2.status).toBe('fail');
    
    const error3 = new AppError('Not found', 404);
    expect(error3.status).toBe('fail');
  });

  it('should be an instance of Error', () => {
    const error = new AppError('Test', 400);
    
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });

  it('should capture stack trace', () => {
    const error = new AppError('Stack test', 500);
    
    expect(error.stack).toBeDefined();
    expect(typeof error.stack).toBe('string');
  });
});
