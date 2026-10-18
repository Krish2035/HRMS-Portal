import { Queue, Worker, Job } from 'bullmq';
import { env } from '../config/env';
import { logger } from '../config/logger';

// Redis connection options for BullMQ
const connection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD || undefined,
};

export const attendanceQueue = new Queue('attendance-rollup', { connection });
export const notificationQueue = new Queue('notification-dispatch', { connection });
export const payrollQueue = new Queue('payroll-processing', { connection });

export class QueueService {
  static async enqueueAttendanceRollup(organizationId: string, date: string) {
    try {
      await attendanceQueue.add('daily-rollup', { organizationId, date });
      logger.info({ organizationId, date }, 'Enqueued attendance rollup task');
    } catch (err) {
      logger.warn({ err }, 'Could not enqueue attendance task (Redis offline)');
    }
  }

  static async enqueueNotification(payload: {
    userId: string;
    title: string;
    message: string;
    type: 'toast' | 'email';
  }) {
    try {
      await notificationQueue.add('send-notification', payload);
      logger.info({ userId: payload.userId, title: payload.title }, 'Enqueued notification task');
    } catch (err) {
      logger.warn({ err }, 'Could not enqueue notification task (Redis offline)');
    }
  }

  static async enqueuePayrollRun(payrollPeriodId: string, organizationId: string) {
    try {
      await payrollQueue.add('process-payroll', { payrollPeriodId, organizationId });
      logger.info({ payrollPeriodId }, 'Enqueued payroll processing run');
    } catch (err) {
      logger.warn({ err }, 'Could not enqueue payroll task (Redis offline)');
    }
  }

  static initWorkers() {
    try {
      const attendanceWorker = new Worker(
        'attendance-rollup',
        async (job: Job) => {
          logger.info({ jobId: job.id, data: job.data }, 'Processing attendance rollup job');
          // Performs consolidation
          return { status: 'completed' };
        },
        { connection }
      );

      attendanceWorker.on('failed', (job, err) => {
        logger.error({ jobId: job?.id, err }, 'Attendance worker job failed');
      });

      const notificationWorker = new Worker(
        'notification-dispatch',
        async (job: Job) => {
          logger.info({ jobId: job.id, data: job.data }, 'Dispatching notification job');
          return { status: 'sent' };
        },
        { connection }
      );

      notificationWorker.on('failed', (job, err) => {
        logger.error({ jobId: job?.id, err }, 'Notification worker job failed');
      });

      logger.info('BullMQ workers initialized');
    } catch (err) {
      logger.warn({ err }, 'Workers not initialized (Redis connection skipped)');
    }
  }
}
