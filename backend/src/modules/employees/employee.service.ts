import { eq, and, ilike, or, desc } from 'drizzle-orm';
import { db } from '../../config/database';
import { employeeProfiles, users, departments, designations, employeeManagers } from '../../db/schema';

export class EmployeeService {
  /**
   * List employees with filtering and search
   */
  static async listEmployees(params: {
    organizationId: string;
    search?: string;
    departmentId?: string;
    limit?: number;
    offset?: number;
  }) {
    const { organizationId, search, departmentId, limit = 50, offset = 0 } = params;

    let query = db
      .select({
        id: employeeProfiles.id,
        employeeCode: employeeProfiles.employeeCode,
        firstName: employeeProfiles.firstName,
        lastName: employeeProfiles.lastName,
        phone: employeeProfiles.phone,
        joiningDate: employeeProfiles.joiningDate,
        employmentType: employeeProfiles.employmentType,
        workLocation: employeeProfiles.workLocation,
        email: users.email,
        status: users.status,
        departmentName: departments.name,
        designationName: designations.name,
      })
      .from(employeeProfiles)
      .innerJoin(users, eq(employeeProfiles.userId, users.id))
      .leftJoin(departments, eq(employeeProfiles.departmentId, departments.id))
      .leftJoin(designations, eq(employeeProfiles.designationId, designations.id))
      .where(
        and(
          eq(employeeProfiles.organizationId, organizationId),
          departmentId ? eq(employeeProfiles.departmentId, departmentId) : undefined,
          search
            ? or(
                ilike(employeeProfiles.firstName, `%${search}%`),
                ilike(employeeProfiles.lastName, `%${search}%`),
                ilike(employeeProfiles.employeeCode, `%${search}%`),
                ilike(users.email, `%${search}%`)
              )
            : undefined
        )
      )
      .orderBy(desc(employeeProfiles.createdAt))
      .limit(limit)
      .offset(offset);

    return await query;
  }

  /**
   * Get employee by ID with department, designation, and reporting manager
   */
  static async getEmployeeById(employeeId: string) {
    const [profile] = await db
      .select({
        id: employeeProfiles.id,
        userId: employeeProfiles.userId,
        employeeCode: employeeProfiles.employeeCode,
        firstName: employeeProfiles.firstName,
        lastName: employeeProfiles.lastName,
        phone: employeeProfiles.phone,
        joiningDate: employeeProfiles.joiningDate,
        employmentType: employeeProfiles.employmentType,
        workLocation: employeeProfiles.workLocation,
        email: users.email,
        status: users.status,
        departmentId: employeeProfiles.departmentId,
        departmentName: departments.name,
        designationId: employeeProfiles.designationId,
        designationName: designations.name,
      })
      .from(employeeProfiles)
      .innerJoin(users, eq(employeeProfiles.userId, users.id))
      .leftJoin(departments, eq(employeeProfiles.departmentId, departments.id))
      .leftJoin(designations, eq(employeeProfiles.designationId, designations.id))
      .where(eq(employeeProfiles.id, employeeId))
      .limit(1);

    if (!profile) return null;

    // Fetch primary manager
    const [managerRecord] = await db
      .select({
        managerId: employeeProfiles.id,
        firstName: employeeProfiles.firstName,
        lastName: employeeProfiles.lastName,
        email: users.email,
      })
      .from(employeeManagers)
      .innerJoin(employeeProfiles, eq(employeeManagers.managerId, employeeProfiles.id))
      .innerJoin(users, eq(employeeProfiles.userId, users.id))
      .where(and(eq(employeeManagers.employeeId, employeeId), eq(employeeManagers.isPrimary, true)))
      .limit(1);

    return {
      ...profile,
      manager: managerRecord || null,
    };
  }

  /**
   * Get direct reports for a manager
   */
  static async getDirectReports(managerEmployeeId: string) {
    return await db
      .select({
        id: employeeProfiles.id,
        employeeCode: employeeProfiles.employeeCode,
        firstName: employeeProfiles.firstName,
        lastName: employeeProfiles.lastName,
        email: users.email,
        departmentName: departments.name,
        designationName: designations.name,
      })
      .from(employeeManagers)
      .innerJoin(employeeProfiles, eq(employeeManagers.employeeId, employeeProfiles.id))
      .innerJoin(users, eq(employeeProfiles.userId, users.id))
      .leftJoin(departments, eq(employeeProfiles.departmentId, departments.id))
      .leftJoin(designations, eq(employeeProfiles.designationId, designations.id))
      .where(eq(employeeManagers.managerId, managerEmployeeId));
  }
}
