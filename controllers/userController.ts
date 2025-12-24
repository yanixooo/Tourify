import multer, { FileFilterCallback } from 'multer';
import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Extend Express Request to include user and file
interface AuthRequest extends Request {
  user?: IUser;
  file?: Express.Multer.File;
}

// Multer configuration for memory storage
const multerStorage = multer.memoryStorage();

const multerFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400) as unknown as null, false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadUserPhoto = upload.single('photo');

export const resizeUserPhoto = catchAsync(async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user?.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj: Record<string, unknown>, ...allowedFields: string[]): Record<string, unknown> => {
  const newObj: Record<string, unknown> = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

export const getMe = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  req.params.id = req.user?.id;
  next();
};

export const updateMe = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email') as { name?: string; email?: string; photo?: string };
  if (req.file) filteredBody.photo = req.file.filename;

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user?.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

export const deleteMe = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
  await User.findByIdAndUpdate(req.user?.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const getAllUsers = catchAsync(async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

export const getUser = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const createUser = (_req: Request, res: Response): void => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead',
  });
};

export const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

export const deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
