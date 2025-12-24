import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import Tour from './tourModel.js';

// Review document interface
export interface IReview extends Document {
  review: string;
  rating: number;
  createdAt: Date;
  tour: Types.ObjectId;
  user: Types.ObjectId;
}

// Review model interface with statics
export interface IReviewModel extends Model<IReview> {
  calcAverageRatings(tourId: Types.ObjectId): Promise<void>;
}

// Extended query interface for middleware
interface ReviewQuery extends mongoose.Query<IReview[], IReview> {
  r?: IReview | null;
}

const reviewSchema = new Schema<IReview, IReviewModel>(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Prevent duplicate reviews from the same user on the same tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (this: mongoose.Query<IReview[], IReview>, next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (
  tourId: Types.ObjectId
): Promise<void> {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  // this points to current review
  (this.constructor as IReviewModel).calcAverageRatings(this.tour);
});

// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function (this: ReviewQuery, next) {
  this.r = await this.model.findOne(this.getQuery());
  next();
});

reviewSchema.post(/^findOneAnd/, async function (this: ReviewQuery) {
  // await this.findOne(); does NOT work here, query has already executed
  if (this.r) await (this.r.constructor as IReviewModel).calcAverageRatings(this.r.tour);
});

const Review = mongoose.model<IReview, IReviewModel>('Review', reviewSchema);

export default Review;
