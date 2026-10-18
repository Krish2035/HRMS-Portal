import { pgTable, uuid, varchar, text, date, numeric, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';
import { employeeProfiles } from './employee-profiles';
import { users } from './users';

export const leaveTypes = pgTable(
  'leave_types',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    name: varchar('name', { length: 100 }).notNull(), // 'Annual Leave', 'Sick Leave', 'Casual Leave'
    code: varchar('code', { length: 50 }).notNull(),
    daysPerYear: numeric('days_per_year', { precision: 4, scale: 1 }).default('12.0').notNull(),
    isPaid: varchar('is_paid', { length: 10 }).default('true').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_leave_type_org_code').on(table.organizationId, table.code),
  ]
);

export const leaveBalances = pgTable(
  'leave_balances',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeId: uuid('employee_id')
      .references(() => employeeProfiles.id, { onDelete: 'cascade' })
      .notNull(),
    leaveTypeId: uuid('leave_type_id')
      .references(() => leaveTypes.id, { onDelete: 'cascade' })
      .notNull(),
    year: varchar('year', { length: 4 }).notNull(),
    allocatedDays: numeric('allocated_days', { precision: 4, scale: 1 }).default('0.0').notNull(),
    usedDays: numeric('used_days', { precision: 4, scale: 1 }).default('0.0').notNull(),
    pendingDays: numeric('pending_days', { precision: 4, scale: 1 }).default('0.0').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_leave_bal_emp_type_year').on(table.employeeId, table.leaveTypeId, table.year),
  ]
);

export const leaveRequests = pgTable(
  'leave_requests',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    employeeId: uuid('employee_id')
      .references(() => employeeProfiles.id, { onDelete: 'cascade' })
      .notNull(),
    leaveTypeId: uuid('leave_type_id')
      .references(() => leaveTypes.id, { onDelete: 'cascade' })
      .notNull(),
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    daysCount: numeric('days_count', { precision: 4, scale: 1 }).notNull(),
    reason: text('reason').notNull(),
    status: varchar('status', { length: 20 }).default('pending').notNull(), // 'pending', 'approved', 'rejected', 'cancelled'
    approverId: uuid('approver_id').references(() => users.id, { onDelete: 'set null' }),
    approverComment: text('approver_comment'),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_leave_req_emp').on(table.employeeId),
    index('idx_leave_req_status').on(table.status),
  ]
);

export type LeaveType = typeof leaveTypes.$inferSelect;
export type LeaveBalance = typeof leaveBalances.$inferSelect;
export type LeaveRequest = typeof leaveRequests.$inferSelect;
