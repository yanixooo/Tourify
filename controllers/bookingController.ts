import Stripe from 'stripe';
import { Request, Response, NextFunction } from 'express';
import Tour from '../models/tourModel.js';
import User, { IUser } from '../models/userModel.js';
import Booking from '../models/bookingModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Extend Request to include user
interface AuthRequest extends Request {
  user?: IUser;
}

// Initialize Stripe lazily to avoid issues with env vars not being loaded
const getStripe = (): Stripe | null => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

export const getCheckoutSession = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const stripe = getStripe();
  if (!stripe) {
    return next(
      new AppError(
        'Payment system not configured. Please contact support.',
        500
      )
    );
  }

  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user?.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [
              `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
            ],
          },
        },
        quantity: 1,
      },
    ],
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session,
  });
});

export const createBookingCheckout = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price: Number(price) });

  res.redirect(req.originalUrl.split('?')[0]);
});

interface StripeSession {
  client_reference_id: string;
  customer_email: string;
  amount_total: number;
}

export const webhookCheckout = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const stripe = getStripe();
  if (!stripe) {
    res.status(500).send('Payment system not configured');
    return;
  }

  const signature = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    res.status(400).send(`Webhook error: ${(err as Error).message}`);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as StripeSession;
    await createBookingFromSession(session);
  }

  res.status(200).json({ received: true });
};

const createBookingFromSession = async (session: StripeSession): Promise<void> => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email }))?._id;
  const price = session.amount_total / 100;
  await Booking.create({ tour, user, price });
};

// CRUD Operations for bookings
export const getAllBookings = catchAsync(async (_req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const bookings = await Booking.find();

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      bookings,
    },
  });
});

export const getBooking = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      booking,
    },
  });
});

export const createBooking = catchAsync(async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
  const newBooking = await Booking.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      booking: newBooking,
    },
  });
});

export const updateBooking = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      booking,
    },
  });
});

export const deleteBooking = catchAsync(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const booking = await Booking.findByIdAndDelete(req.params.id);

  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const getMyBookings = catchAsync(async (req: AuthRequest, res: Response, _next: NextFunction): Promise<void> => {
  const bookings = await Booking.find({ user: req.user?.id });

  const tourIDs = bookings.map(el => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});
