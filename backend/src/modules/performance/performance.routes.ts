import { Router } from 'express';
import {
  PerformanceController,
  createGoalSchema,
  updateGoalSchema,
  createReviewSchema,
} from './performance.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';

const router = Router();

router.use(authenticate);

// Employee goals
router.get('/goals', PerformanceController.myGoals);
router.post('/goals', validate(createGoalSchema), PerformanceController.createGoal);
router.patch('/goals/:id', validate(updateGoalSchema), PerformanceController.updateGoal);

// Performance Reviews
router.get('/reviews', PerformanceController.myReviews);
router.post('/reviews', authorize(['super_admin', 'hr_admin', 'manager']), validate(createReviewSchema), PerformanceController.createReview);

export default router;
