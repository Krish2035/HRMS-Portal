import { pgTable, uuid, varchar, date, numeric, timestamp, uniqueIndex, index, text } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';
import { employeeProfiles } from './employee-profiles';

export const timesheets = pgTable(
  'timesheets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    employeeId: uuid('employee_id')
      .references(() => employeeProfiles.id, { onDelete: 'cascade' })
      .notNull(),
    periodStartDate: date('period_start_date').notNull(), // e.g. "2026-10-12" (Monday)
    periodEndDate: date('period_end_date').notNull(), // e.g. "2026-10-18" (Sunday)
    regularHours: numeric('regular_hours', { precision: 6, scale: 2 }).default('0.00').notNull(),
    overtimeHours: numeric('overtime_hours', { precision: 6, scale: 2 }).default('0.00').notNull(),
    totalHours: numeric('total_hours', { precision: 6, scale: 2 }).default('0.00').notNull(),
    status: varchar('status', { length: 20 }).default('draft').notNull(), // 'draft', 'submitted', 'approved', 'rejected', 'locked'
    submittedAt: timestamp('submitted_at', { withTimezone: true }),
    reviewedBy: uuid('reviewed_by').references(() => employeeProfiles.id, { onDelete: 'set null' }),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    rejectionReason: text('rejection_reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_timesheet_emp_period').on(table.employeeId, table.periodStartDate),
    index('idx_timesheet_org_status').on(table.organizationId, table.status),
    index('idx_timesheet_reviewed_by').on(table.reviewedBy),
  ]
);

export type Timesheet = typeof timesheets.$inferSelect;
export type NewTimesheet = typeof timesheets.$inferInsert;
