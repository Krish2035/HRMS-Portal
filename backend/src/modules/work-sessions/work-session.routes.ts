import { Router } from 'express';
import {
  WorkSessionController,
  startSessionSchema,
  pauseSessionSchema,
  endSessionSchema,
  correctionRequestSchema,
} from './work-session.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';

const router = Router();

// All work-session routes require authentication
router.use(authenticate);

router.post('/start', validate(startSessionSchema), WorkSessionController.start);
router.get('/current', WorkSessionController.current);
router.get('/summary', WorkSessionController.summary);
router.get('/history', WorkSessionController.history);

router.post('/:sessionId/pause', validate(pauseSessionSchema), WorkSessionController.pause);
router.post('/:sessionId/resume', WorkSessionController.resume);
router.post('/:sessionId/end', validate(endSessionSchema), WorkSessionController.end);
router.post(
  '/:sessionId/correction-requests',
  validate(correctionRequestSchema),
  WorkSessionController.submitCorrection
);

export default router;
