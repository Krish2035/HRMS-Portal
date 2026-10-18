import { pgTable, uuid, varchar, text, date, integer, numeric, timestamp, index } from 'drizzle-orm/pg-core';
import { organizations } from './organizations';
import { employeeProfiles } from './employee-profiles';
import { users } from './users';

export const employeeGoals = pgTable(
  'employee_goals',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    employeeId: uuid('employee_id')
      .references(() => employeeProfiles.id, { onDelete: 'cascade' })
      .notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    targetDate: date('target_date').notNull(),
    status: varchar('status', { length: 20 }).default('in_progress').notNull(), // 'pending', 'in_progress', 'completed', 'cancelled'
    progress: integer('progress').default(0).notNull(), // 0 to 100
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_goals_emp').on(table.employeeId),
  ]
);

export const performanceReviews = pgTable(
  'performance_reviews',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .references(() => organizations.id, { onDelete: 'cascade' })
      .notNull(),
    employeeId: uuid('employee_id')
      .references(() => employeeProfiles.id, { onDelete: 'cascade' })
      .notNull(),
    reviewerId: uuid('reviewer_id')
      .references(() => users.id, { onDelete: 'set null' }),
    reviewPeriod: varchar('review_period', { length: 50 }).notNull(), // e.g. "Annual 2026", "Q3 2026"
    rating: numeric('rating', { precision: 3, scale: 1 }).notNull(), // 1.0 - 5.0
    strengths: text('strengths'),
    improvements: text('improvements'),
    feedback: text('feedback').notNull(),
    status: varchar('status', { length: 20 }).default('draft').notNull(), // 'draft', 'submitted', 'acknowledged'
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('idx_reviews_emp').on(table.employeeId),
    index('idx_reviews_reviewer').on(table.reviewerId),
  ]
);

export type EmployeeGoal = typeof employeeGoals.$inferSelect;
export type PerformanceReview = typeof performanceReviews.$inferSelect;
