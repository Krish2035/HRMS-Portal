import { pgTable, uuid, varchar, numeric, boolean, integer, timestamp } from 'drizzle-orm/pg-core';

export const organizations = pgTable('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }).unique().notNull(),
  timeZone: varchar('time_zone', { length: 50 }).default('UTC').notNull(),
  workDayHours: numeric('work_day_hours', { precision: 4, scale: 2 }).default('8.00').notNull(),
  allowBreaks: boolean('allow_breaks').default(true).notNull(),
  maxBreakMinutes: integer('max_break_minutes').default(60).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
