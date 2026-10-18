import { pgTable, uuid, varchar, date, boolean, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';
import { users } from './users';
import { departments, designations } from './departments';

export const employeeProfiles = pgTable(
  'employee_profiles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .unique()
      .notNull(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    employeeCode: varchar('employee_code', { length: 50 }).notNull(),
    firstName: varchar('first_name', { length: 100 }).notNull(),
    lastName: varchar('last_name', { length: 100 }).notNull(),
    phone: varchar('phone', { length: 30 }),
    departmentId: uuid('department_id').references(() => departments.id, { onDelete: 'set null' }),
    designationId: uuid('designation_id').references(() => designations.id, { onDelete: 'set null' }),
    joiningDate: date('joining_date').notNull(),
    employmentType: varchar('employment_type', { length: 30 }).default('full_time').notNull(), // 'full_time', 'part_time', 'contract', 'intern'
    workLocation: varchar('work_location', { length: 50 }).default('office').notNull(), // 'office', 'remote', 'hybrid'
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_emp_org_code').on(table.organizationId, table.employeeCode),
    index('idx_emp_user_id').on(table.userId),
    index('idx_emp_department').on(table.departmentId),
  ]
);

export const employeeManagers = pgTable(
  'employee_managers',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeId: uuid('employee_id')
      .references(() => employeeProfiles.id, { onDelete: 'cascade' })
      .notNull(),
    managerId: uuid('manager_id')
      .references(() => employeeProfiles.id, { onDelete: 'cascade' })
      .notNull(),
    isPrimary: boolean('is_primary').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('idx_emp_manager_unique').on(table.employeeId, table.managerId),
  ]
);

export type EmployeeProfile = typeof employeeProfiles.$inferSelect;
export type NewEmployeeProfile = typeof employeeProfiles.$inferInsert;
