import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import workSessionRoutes from '../modules/work-sessions/work-session.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/work-sessions', workSessionRoutes);

export default router;
