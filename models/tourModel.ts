import mongoose, { Document, Model, Schema } from 'mongoose';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const slugify = require('slugify');

// Location interface for GeoJSON
export interface ILocation {
  type: 'Point';
  coordinates: [number, number];
  address?: string;
  description?: string;
  day?: number;
}

// Tour document interface
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
  privateTour: boolean;
  startLocation: ILocation;
  locations: ILocation[];
  guides: mongoose.Types.ObjectId[];
  durationWeeks?: number;
}

// Tour model interface
export interface ITourModel extends Model<ITour> {}

const tourSchema = new Schema<ITour, ITourModel>(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have less or equal than 40 characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult',
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: { type: Number, required: [true, 'A tour must have a price'] },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (this: ITour, val: number): boolean {
          // this only points to current document on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an image cover'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    privateTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeeks').get(function (this: ITour) {
  return this.duration / 7;
});

// Virtual populate for reviews
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE .save() and .create()
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// QUERY MIDDLEWARE
tourSchema.pre(/^find/, function (this: any, next) {
  this.find({ privateTour: { $ne: true } });
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });

  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (this: any, _docs, next) {
  console.log(`Query took ${Date.now() - (this.start || 0)} milliseconds`);
  next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { privateTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model<ITour, ITourModel>('Tour', tourSchema);

export default Tour;
