import { pgTable, uuid, varchar, date, numeric, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';
import { employeeProfiles } from './employee-profiles';

export const attendanceRecords = pgTable(
  'attendance_records',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    employeeId: uuid('employee_id')
      .references(() => employeeProfiles.id, { onDelete: 'cascade' })
      .notNull(),
    attendanceDate: date('attendance_date').notNull(),
    status: varchar('status', { length: 20 }).default('present').notNull(), // 'present', 'absent', 'half_day', 'on_leave', 'holiday'
    totalHoursWorked: numeric('total_hours_worked', { precision: 5, scale: 2 }).default('0.00').notNull(),
    firstPunchIn: timestamp('first_punch_in', { withTimezone: true }),
    lastPunchOut: timestamp('last_punch_out', { withTimezone: true }),
    isLate: varchar('is_late', { length: 10 }).default('false').notNull(),
    isOvertime: varchar('is_overtime', { length: 10 }).default('false').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_att_emp_date').on(table.employeeId, table.attendanceDate),
    index('idx_att_org_date').on(table.organizationId, table.attendanceDate),
    index('idx_att_org_status_date').on(table.organizationId, table.status, table.attendanceDate),
  ]
);

export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type NewAttendanceRecord = typeof attendanceRecords.$inferInsert;
