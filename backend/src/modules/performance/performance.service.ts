import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../config/database';
import { employeeGoals, performanceReviews, employeeProfiles, users } from '../../db/schema';

export class PerformanceService {
  static async getEmployeeGoals(employeeId: string) {
    return await db
      .select()
      .from(employeeGoals)
      .where(eq(employeeGoals.employeeId, employeeId))
      .orderBy(desc(employeeGoals.createdAt));
  }

  static async createGoal(params: {
    employeeId: string;
    organizationId: string;
    title: string;
    description?: string;
    targetDate: string;
  }) {
    const [goal] = await db
      .insert(employeeGoals)
      .values({
        organizationId: params.organizationId,
        employeeId: params.employeeId,
        title: params.title,
        description: params.description,
        targetDate: params.targetDate,
        status: 'in_progress',
        progress: 0,
      })
      .returning();

    return goal;
  }

  static async updateGoal(params: {
    goalId: string;
    employeeId: string;
    progress?: number;
    status?: string;
  }) {
    const [updated] = await db
      .update(employeeGoals)
      .set({
        ...(params.progress !== undefined ? { progress: params.progress } : {}),
        ...(params.status ? { status: params.status } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(employeeGoals.id, params.goalId), eq(employeeGoals.employeeId, params.employeeId)))
      .returning();

    return updated;
  }

  static async getReviews(employeeId: string) {
    return await db
      .select({
        id: performanceReviews.id,
        reviewPeriod: performanceReviews.reviewPeriod,
        rating: performanceReviews.rating,
        strengths: performanceReviews.strengths,
        improvements: performanceReviews.improvements,
        feedback: performanceReviews.feedback,
        status: performanceReviews.status,
        createdAt: performanceReviews.createdAt,
        reviewerEmail: users.email,
      })
      .from(performanceReviews)
      .leftJoin(users, eq(performanceReviews.reviewerId, users.id))
      .where(eq(performanceReviews.employeeId, employeeId))
      .orderBy(desc(performanceReviews.createdAt));
  }

  static async createReview(params: {
    employeeId: string;
    organizationId: string;
    reviewerId: string;
    reviewPeriod: string;
    rating: string;
    strengths?: string;
    improvements?: string;
    feedback: string;
  }) {
    const [review] = await db
      .insert(performanceReviews)
      .values({
        ...params,
        status: 'submitted',
      })
      .returning();

    return review;
  }
}
