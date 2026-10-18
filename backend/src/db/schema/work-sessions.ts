import { pgTable, uuid, varchar, integer, text, jsonb, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { organizations } from './organizations';
import { employeeProfiles } from './employee-profiles';
import { users } from './users';

export const workSessions = pgTable(
  'work_sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    employeeId: uuid('employee_id')
      .references(() => employeeProfiles.id, { onDelete: 'cascade' })
      .notNull(),
    status: varchar('status', { length: 30 }).notNull(), // 'running', 'paused', 'completed', 'interrupted', 'correction_requested'
    startTime: timestamp('start_time', { withTimezone: true }).notNull(),
    endTime: timestamp('end_time', { withTimezone: true }),
    totalBreakDurationSeconds: integer('total_break_duration_seconds').default(0).notNull(),
    netWorkDurationSeconds: integer('net_work_duration_seconds').default(0).notNull(),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: text('user_agent'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_work_sessions_employee').on(table.employeeId),
    index('idx_work_sessions_status').on(table.status),
    index('idx_work_sessions_start_time').on(table.startTime),
    index('idx_work_sessions_org_start').on(table.organizationId, table.startTime),
    // CRITICAL: Prevent concurrent active sessions for any employee
    uniqueIndex('idx_unique_active_session')
      .on(table.employeeId)
      .where(sql`status IN ('running', 'paused')`),
  ]
);

export const breakRecords = pgTable(
  'break_records',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workSessionId: uuid('work_session_id')
      .references(() => workSessions.id, { onDelete: 'cascade' })
      .notNull(),
    breakType: varchar('break_type', { length: 50 }).default('general').notNull(), // 'coffee', 'lunch', 'meeting', 'general'
    startTime: timestamp('start_time', { withTimezone: true }).notNull(),
    endTime: timestamp('end_time', { withTimezone: true }),
    durationSeconds: integer('duration_seconds').default(0).notNull(),
    reason: text('reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_breaks_session').on(table.workSessionId),
  ]
);

export const workSessionEvents = pgTable(
  'work_session_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workSessionId: uuid('work_session_id')
      .references(() => workSessions.id, { onDelete: 'cascade' })
      .notNull(),
    eventType: varchar('event_type', { length: 50 }).notNull(), // 'started', 'paused', 'resumed', 'ended', 'interrupted', 'corrected'
    eventTime: timestamp('event_time', { withTimezone: true }).defaultNow().notNull(),
    metadata: jsonb('metadata').default({}).notNull(),
    actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
  },
  (table) => [
    index('idx_session_events_session').on(table.workSessionId),
  ]
);

export const timeCorrectionRequests = pgTable(
  'time_correction_requests',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    workSessionId: uuid('work_session_id')
      .references(() => workSessions.id, { onDelete: 'cascade' })
      .notNull(),
    employeeId: uuid('employee_id')
      .references(() => employeeProfiles.id, { onDelete: 'cascade' })
      .notNull(),
    proposedStartTime: timestamp('proposed_start_time', { withTimezone: true }).notNull(),
    proposedEndTime: timestamp('proposed_end_time', { withTimezone: true }).notNull(),
    reason: text('reason').notNull(),
    status: varchar('status', { length: 20 }).default('pending').notNull(), // 'pending', 'approved', 'rejected'
    reviewerId: uuid('reviewer_id').references(() => users.id, { onDelete: 'set null' }),
    reviewerComment: text('reviewer_comment'),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_corrections_emp_status').on(table.employeeId, table.status),
  ]
);

export type WorkSession = typeof workSessions.$inferSelect;
export type NewWorkSession = typeof workSessions.$inferInsert;
export type BreakRecord = typeof breakRecords.$inferSelect;
export type TimeCorrectionRequest = typeof timeCorrectionRequests.$inferSelect;
