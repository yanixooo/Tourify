import express, { Router } from 'express';

import * as tourController from '../controllers/tourController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router: Router = express.Router();

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    protect,
    restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    protect,
    restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

export default router;
