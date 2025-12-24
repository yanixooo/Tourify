import { Request, Response, NextFunction } from 'express';
import { Document, Model } from 'mongoose';

// ============================================
// Environment Types
// ============================================
export interface ProcessEnv {
  NODE_ENV: 'development' | 'production';
  PORT: string;
  DATABASE: string;
  DATABASE_PASSWORD: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_COOKIE_EXPIRES_IN: string;
  EMAIL_HOST: string;
  EMAIL_PORT: string;
  EMAIL_USERNAME: string;
  EMAIL_PASSWORD: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
}

// ============================================
// User Types
// ============================================
export interface IUser extends Document {
  name: string;
  email: string;
  photo?: string;
  role: 'user' | 'guide' | 'lead-guide' | 'admin';
  password: string;
  passwordConfirm?: string;
  passwordChangedAt?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  active: boolean;
  correctPassword(candidatePassword: string, userPassword: string): Promise<boolean>;
  changedPasswordAfter(timestamp: number): boolean;
  createPasswordResetToken(): string;
}

export interface IUserModel extends Model<IUser> {}

// ============================================
// Tour Types
// ============================================
export interface ILocation {
  type: 'Point';
  coordinates: [number, number];
  address?: string;
  description?: string;
  day?: number;
}

export interface ITour extends Document {
  name: string;
  slug: string;
  duration: number;
  maxGroupSize: number;
  difficulty: 'easy' | 'medium' | 'difficult';
  ratingsAverage: number;
  ratingsQuantity: number;
  price: number;
  priceDiscount?: number;
  summary: string;
  description?: string;
  imageCover: string;
  images: string[];
  createdAt: Date;
  startDates: Date[];
  secretTour: boolean;
  startLocation: ILocation;
  locations: ILocation[];
  guides: IUser[];
}

export interface ITourModel extends Model<ITour> {}

// ============================================
// Review Types
// ============================================
export interface IReview extends Document {
  review: string;
  rating: number;
  createdAt: Date;
  tour: ITour;
  user: IUser;
}

export interface IReviewModel extends Model<IReview> {
  calcAverageRatings(tourId: string): Promise<void>;
}

// ============================================
// Booking Types
// ============================================
export interface IBooking extends Document {
  tour: ITour;
  user: IUser;
  price: number;
  createdAt: Date;
  paid: boolean;
}

export interface IBookingModel extends Model<IBooking> {}

// ============================================
// Express Extensions
// ============================================
export interface AuthRequest extends Request {
  user?: IUser;
  requestTime?: string;
}

// Controller function type
export type AsyncHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => Promise<void>;
