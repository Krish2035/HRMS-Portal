import { pgTable, uuid, varchar, numeric, boolean, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }).unique().notNull(),
  timeZone: varchar('time_zone', { length: 50 }).default('UTC').notNull(),
  organizationScale: varchar('organization_scale', { length: 50 }).default('growing').notNull(),
  enabledModules: jsonb('enabled_modules')
    .$type<{
      time_tracking: boolean;
      attendance: boolean;
      leaves: boolean;
      timesheets: boolean;
      payroll: boolean;
      performance: boolean;
      audit: boolean;
    }>()
    .default({
      time_tracking: true,
      attendance: true,
      leaves: true,
      timesheets: true,
      payroll: false,
      performance: false,
      audit: false,
    })
    .notNull(),
  workDayHours: numeric('work_day_hours', { precision: 4, scale: 2 }).default('8.00').notNull(),
  allowBreaks: boolean('allow_breaks').default(true).notNull(),
  maxBreakMinutes: integer('max_break_minutes').default(60).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

