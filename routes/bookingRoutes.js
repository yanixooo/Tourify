import express from 'express';
import {
  getCheckoutSession,
  getAllBookings,
  getBooking,
  createBooking,
  updateBooking,
  deleteBooking,
  getMyBookings,
} from '../controllers/bookingController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

// All routes below this middleware are protected
router.use(protect);

router.get('/checkout-session/:tourId', getCheckoutSession);
router.get('/my-bookings', getMyBookings);

// Admin only routes
router.use(restrictTo('admin', 'lead-guide'));

router.route('/').get(getAllBookings).post(createBooking);

router.route('/:id').get(getBooking).patch(updateBooking).delete(deleteBooking);

export default router;
