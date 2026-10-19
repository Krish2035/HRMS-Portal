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
import { protectIdorAndRola } from '../../middleware/object-auth';

const router = Router();

// All work-session routes require authentication
router.use(authenticate);

router.post('/start', validate(startSessionSchema), WorkSessionController.start);
router.get('/current', WorkSessionController.current);
router.get('/summary', WorkSessionController.summary);
router.get('/history', WorkSessionController.history);

router.post(
  '/:sessionId/pause',
  protectIdorAndRola({ resource: 'work_sessions', idParam: 'sessionId' }),
  validate(pauseSessionSchema),
  WorkSessionController.pause
);
router.post(
  '/:sessionId/resume',
  protectIdorAndRola({ resource: 'work_sessions', idParam: 'sessionId' }),
  WorkSessionController.resume
);
router.post(
  '/:sessionId/end',
  protectIdorAndRola({ resource: 'work_sessions', idParam: 'sessionId' }),
  validate(endSessionSchema),
  WorkSessionController.end
);
router.post(
  '/:sessionId/correction-requests',
  protectIdorAndRola({ resource: 'work_sessions', idParam: 'sessionId' }),
  validate(correctionRequestSchema),
  WorkSessionController.submitCorrection
);

export default router;
