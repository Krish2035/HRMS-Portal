import { eq, and, ilike, or, desc } from 'drizzle-orm';
import { db } from '../../config/database';
import { employeeProfiles, users, departments, designations, employeeManagers, roles, userRoles } from '../../db/schema';
import { CacheService } from '../../cache/cache.service';
import { AuthService } from '../auth/auth.service';

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

    const query = db
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
   * Get employee by ID with department, designation, and reporting manager (cached)
   */
  static async getEmployeeById(employeeId: string) {
    const cacheKey = `emp:${employeeId}:profile`;

    return await CacheService.getOrSet(
      cacheKey,
      async () => {
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
      },
      900 // 15 mins TTL
    );
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

  /**
   * Onboard a new employee with either Hourly or Salaried compensation
   */
  static async createEmployee(params: {
    organizationId: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    roleSlug?: string;
    departmentId?: string;
    designationId?: string;
    joiningDate?: string;
    employmentType?: string;
    workLocation?: string;
    compensationType: 'salaried' | 'hourly';
    baseSalary?: number;
    hourlyRate?: number;
    overtimeRateMultiplier?: number;
    standardWeeklyHours?: number;
    managerId?: string;
  }) {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, params.email.toLowerCase().trim()))
      .limit(1);

    if (existing.length > 0) {
      throw new Error('A user with this email address already exists');
    }

    const defaultPassword = params.password || 'EmployeePass@2026';
    const passwordHash = await AuthService.hashPassword(defaultPassword);

    // Generate next employee code
    const existingEmployees = await db
      .select({ id: employeeProfiles.id })
      .from(employeeProfiles)
      .where(eq(employeeProfiles.organizationId, params.organizationId));

    const nextNumber = existingEmployees.length + 1;
    const employeeCode = `EMP-${nextNumber.toString().padStart(5, '0')}`;

    return await db.transaction(async (tx) => {
      // 1. Create User
      const [newUser] = await tx
        .insert(users)
        .values({
          organizationId: params.organizationId,
          email: params.email.toLowerCase().trim(),
          passwordHash,
          status: 'active',
        })
        .returning();


      // 2. Fetch or assign role
      const [roleRecord] = await tx
        .select()
        .from(roles)
        .where(
          and(
            eq(roles.organizationId, params.organizationId),
            eq(roles.slug, params.roleSlug || 'employee')
          )
        )
        .limit(1);

      if (roleRecord) {
        await tx.insert(userRoles).values({
          userId: newUser.id,
          roleId: roleRecord.id,
        });
      }

      // 3. Create Employee Profile with Compensation Structure
      const [profile] = await tx
        .insert(employeeProfiles)
        .values({
          userId: newUser.id,
          organizationId: params.organizationId,
          employeeCode,
          firstName: params.firstName.trim(),
          lastName: params.lastName.trim(),
          departmentId: params.departmentId || null,
          designationId: params.designationId || null,
          joiningDate: params.joiningDate || new Date().toISOString().slice(0, 10),
          employmentType: params.employmentType || (params.compensationType === 'hourly' ? 'contract' : 'full_time'),
          workLocation: params.workLocation || 'office',
          compensationType: params.compensationType,
          baseSalary: (params.baseSalary || 0).toFixed(2),
          hourlyRate: (params.hourlyRate || 0).toFixed(2),
          overtimeRateMultiplier: (params.overtimeRateMultiplier || 1.50).toFixed(2),
          standardWeeklyHours: (params.standardWeeklyHours || 40.00).toFixed(2),
        })
        .returning();

      // 4. Link Reporting Manager if provided
      if (params.managerId) {
        await tx.insert(employeeManagers).values({
          employeeId: profile.id,
          managerId: params.managerId,
          isPrimary: true,
        });
      }

      return {
        profile,
        user: {
          id: newUser.id,
          email: newUser.email,
          temporaryPassword: defaultPassword,
        },
      };
    });
  }
}

