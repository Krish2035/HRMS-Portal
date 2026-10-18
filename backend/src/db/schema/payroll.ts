import { pgTable, uuid, varchar, date, numeric, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';
import { employeeProfiles } from './employee-profiles';

export const payrollPeriods = pgTable(
  'payroll_periods',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    name: varchar('name', { length: 100 }).notNull(), // e.g. "October 2026"
    startDate: date('start_date').notNull(),
    endDate: date('end_date').notNull(),
    status: varchar('status', { length: 20 }).default('draft').notNull(), // 'draft', 'processing', 'finalized', 'paid'
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_payroll_period_org_name').on(table.organizationId, table.name),
  ]
);

export const payrollRecords = pgTable(
  'payroll_records',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    payrollPeriodId: uuid('payroll_period_id')
      .references(() => payrollPeriods.id, { onDelete: 'cascade' })
      .notNull(),
    employeeId: uuid('employee_id')
      .references(() => employeeProfiles.id, { onDelete: 'cascade' })
      .notNull(),
    baseSalary: numeric('base_salary', { precision: 12, scale: 2 }).notNull(),
    allowances: numeric('allowances', { precision: 12, scale: 2 }).default('0.00').notNull(),
    deductions: numeric('deductions', { precision: 12, scale: 2 }).default('0.00').notNull(),
    netSalary: numeric('net_salary', { precision: 12, scale: 2 }).notNull(),
    status: varchar('status', { length: 20 }).default('pending').notNull(), // 'pending', 'paid'
    paymentDate: date('payment_date'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_payroll_rec_period_emp').on(table.payrollPeriodId, table.employeeId),
    index('idx_payroll_rec_emp').on(table.employeeId),
  ]
);

export type PayrollPeriod = typeof payrollPeriods.$inferSelect;
export type PayrollRecord = typeof payrollRecords.$inferSelect;
