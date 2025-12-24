import multer, { FileFilterCallback } from 'multer';
import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';
import Tour from './../models/tourModel.js';
import APIFeatures from './../utils/apiFeatures.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Extend Express Request for file uploads
interface TourRequest extends Request {
  files?: {
    imageCover?: Express.Multer.File[];
    images?: Express.Multer.File[];
  };
  aliasSettings?: {
    limit: string;
    sort: string;
    fields: string;
  };
}

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

export const uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

export const resizeTourImages = catchAsync(async (req: TourRequest, _res: Response, next: NextFunction): Promise<void> => {
  if (!req.files?.imageCover && !req.files?.images) return next();

  // 1) Cover image
  if (req.files.imageCover) {
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${req.body.imageCover}`);
  }

  // 2) Images
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

        await sharp(file.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`public/img/tours/${filename}`);

        req.body.images.push(filename);
      })
    );
  }

  next();
});

export const aliasTopTours = (req: Request, _res: Response, next: NextFunction): void => {
  const tourReq = req as TourRequest;
  tourReq.aliasSettings = {
    limit: '5',
    sort: '-ratingsAverage,price',
    fields: 'name,price,ratingsAverage,summary,difficulty',
  };
  next();
};

export const getAllTours = catchAsync(async (req: TourRequest, res: Response, _next: NextFunction): Promise<void> => {
  // Merge alias settings with query parameters
  const queryObj = { ...req.query };

  if (req.aliasSettings) {
    Object.assign(queryObj, req.aliasSettings);
  }
  // EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), queryObj)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

export const getTour = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

export const createTour = catchAsync(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

export const updateTour = catchAsync(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

export const deleteTour = catchAsync(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  await Tour.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const getTourStats = catchAsync(async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        avgPrice: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

export const getMonthlyPlan = catchAsync(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const year = Number(req.params.year);
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    {
      $limit: 12,
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
