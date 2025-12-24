import { Request, Response, NextFunction } from 'express';
import Review from '../models/reviewModel.js';
import { IUser } from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Extend Request to include user
interface AuthRequest extends Request {
  user?: IUser;
}

export const getAllReviews = catchAsync(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  let filter: { tour?: string } = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

export const getReview = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

export const setTourUserIds = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user?.id;
  next();
};

export const createReview = catchAsync(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview,
    },
  });
});

export const updateReview = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

export const deleteReview = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const review = await Review.findByIdAndDelete(req.params.id);

  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
