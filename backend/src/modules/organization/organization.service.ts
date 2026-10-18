import { eq } from 'drizzle-orm';
import { db } from '../../config/database';
import { organizations, departments, designations } from '../../db/schema';

export class OrganizationService {
  static async getDetails(organizationId: string) {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, organizationId)).limit(1);
    if (!org) return null;

    const deptList = await db.select().from(departments).where(eq(departments.organizationId, organizationId));
    const desigList = await db.select().from(designations).where(eq(designations.organizationId, organizationId));

    return {
      organization: org,
      departments: deptList,
      designations: desigList,
    };
  }

  static async updateSettings(
    organizationId: string,
    params: {
      name?: string;
      timeZone?: string;
      workDayHours?: string;
      allowBreaks?: boolean;
      maxBreakMinutes?: number;
    }
  ) {
    const [updated] = await db
      .update(organizations)
      .set({
        ...params,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, organizationId))
      .returning();

    return updated;
  }
}
