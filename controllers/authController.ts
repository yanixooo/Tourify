import crypto from 'crypto';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import User, { IUser } from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import sendEmail from '../utils/email.js';

// Extend Express Request to include user
interface AuthRequest extends Request {
  user?: IUser;
}

interface DecodedToken extends JwtPayload {
  id: string;
  iat: number;
}

// Helper function to verify JWT token
const verifyToken = (token: string, secret: string): Promise<DecodedToken> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded as DecodedToken);
    });
  });
};

const signToken = (id: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined');
  
  const expiresIn = (process.env.JWT_EXPIRES_IN || '90d') as jwt.SignOptions['expiresIn'];
  
  return jwt.sign({ id }, secret, { expiresIn });
};

interface CookieOptions {
  expires: Date;
  httpOnly: boolean;
  secure?: boolean;
}

const createSendToken = (user: IUser, statusCode: number, res: Response): void => {
  const token = signToken((user._id as any).toString());
  const cookieOptions: CookieOptions = {
    expires: new Date(
      Date.now() + Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined as unknown as string;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

export const signup = catchAsync(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(newUser, 201, res);
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});

export const logout = (_req: Request, res: Response): void => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

export const protect = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  // 1) Getting token and check if it's there
  let token: string | undefined;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decoded = await verifyToken(token, process.env.JWT_SECRET as string);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

// Only for rendered pages, no errors!
export const isLoggedIn = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  if (req.cookies.jwt) {
    try {
      // 1) Verify token
      const decoded = await verifyToken(req.cookies.jwt, process.env.JWT_SECRET as string);

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (_err) {
      return next();
    }
  }
  next();
};

export const restrictTo = (...roles: string[]): RequestHandler => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    // roles ['admin', 'lead-guide']
    if (!req.user || !roles.includes(req.user.role)) {
      next(
        new AppError('You do not have permission to perform this action', 403)
      );
      return;
    }

    next();
  };
};

export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #55c57a;">Password Reset Request</h2>
          <p>Hi ${user.name},</p>
          <p>You requested a password reset. Click the button below to reset your password:</p>
          <a href="${resetURL}" style="display: inline-block; background: #55c57a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
          <p>This link will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>— The Tourify Team</p>
        </div>
      `,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (_err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!', 500)
    );
  }
});

export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

export const updatePassword = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  // 1) Get user from collection
  const user = await User.findById(req.user?.id).select('+password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});
