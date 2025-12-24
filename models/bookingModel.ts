import mongoose, { Document, Model, Schema, Types } from 'mongoose';

// Booking document interface
export interface IBooking extends Document {
  tour: Types.ObjectId;
  user: Types.ObjectId;
  price: number;
  createdAt: Date;
  paid: boolean;
}

// Booking model interface
export interface IBookingModel extends Model<IBooking> {}

const bookingSchema = new Schema<IBooking, IBookingModel>(
  {
    tour: {
      type: Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Booking must belong to a Tour!'],
    },
    user: {
      type: Schema.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a User!'],
    },
    price: {
      type: Number,
      required: [true, 'Booking must have a price.'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    paid: {
      type: Boolean,
      default: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

bookingSchema.pre(/^find/, function (this: mongoose.Query<IBooking[], IBooking>, next) {
  this.populate('user').populate({
    path: 'tour',
    select: 'name',
  });
  next();
});

const Booking = mongoose.model<IBooking, IBookingModel>('Booking', bookingSchema);

export default Booking;
