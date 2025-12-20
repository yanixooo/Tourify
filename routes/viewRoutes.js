import express from 'express';
import * as viewsController from '../controllers/viewsController.js';
import * as authController from '../controllers/authController.js';

const router = express.Router();

// Middleware to check if user is logged in (for rendering)
router.use(authController.isLoggedIn);

router.get('/', viewsController.getOverview);
router.get('/tour/:slug', viewsController.getTour);
router.get('/login', viewsController.getLoginForm);
router.get('/signup', viewsController.getSignupForm);
router.get('/me', authController.protect, viewsController.getAccount);

export default router;
