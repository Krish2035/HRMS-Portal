import { eq } from 'drizzle-orm';
import { db } from '../../config/database';
import { organizations, departments, designations, users, roles, userRoles, employeeProfiles } from '../../db/schema';
import { CacheService } from '../../cache/cache.service';
import { AuthService } from '../auth/auth.service';

export class OrganizationService {
  /**
   * Self-service organization onboarding with Super Admin creation and default setup
   */
  static async registerOrganization(params: {
    companyName: string;
    adminName: string;
    adminEmail: string;
    password: string;
    timeZone?: string;
  }) {
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, params.adminEmail.toLowerCase().trim()))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error('An account with this email address already exists');
    }

    const baseCode = params.companyName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'COMPANY';
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const orgCode = `${baseCode}-${randomSuffix}`;

    return await db.transaction(async (tx) => {
      // 1. Create Organization
      const [newOrg] = await tx
        .insert(organizations)
        .values({
          name: params.companyName.trim(),
          code: orgCode,
          timeZone: params.timeZone || 'UTC',
          workDayHours: '8.00',
          allowBreaks: true,
          maxBreakMinutes: 60,
        })
        .returning();

      // 2. Hash Password with Argon2id
      const passwordHash = await AuthService.hashPassword(params.password);

      // 3. Create Super Admin User
      const [adminUser] = await tx
        .insert(users)
        .values({
          organizationId: newOrg.id,
          email: params.adminEmail.toLowerCase().trim(),
          passwordHash,
          status: 'active',
        })
        .returning();


      // 4. Create Standard System Roles for this Organization
      const [superAdminRole] = await tx
        .insert(roles)
        .values({
          organizationId: newOrg.id,
          name: 'Super Administrator',
          slug: 'super_admin',
          description: 'Full organizational system authority',
          isSystemRole: true,
        })
        .returning();

      await tx.insert(roles).values([
        {
          organizationId: newOrg.id,
          name: 'HR Administrator',
          slug: 'hr_admin',
          description: 'HR and payroll management',
          isSystemRole: true,
        },
        {
          organizationId: newOrg.id,
          name: 'Department Manager',
          slug: 'manager',
          description: 'Team and timesheet management',
          isSystemRole: true,
        },
        {
          organizationId: newOrg.id,
          name: 'Employee',
          slug: 'employee',
          description: 'Standard work timer and self-service access',
          isSystemRole: true,
        },
      ]);

      // 5. Assign super_admin role to user
      await tx.insert(userRoles).values({
        userId: adminUser.id,
        roleId: superAdminRole.id,
      });

      // 6. Create Default Department
      const [dept] = await tx
        .insert(departments)
        .values({
          organizationId: newOrg.id,
          name: 'Executive Leadership',
          code: 'EXEC',
        })
        .returning();

      // 7. Create Employee Profile for Admin
      const nameParts = params.adminName.trim().split(' ');
      const firstName = nameParts[0] || 'Admin';
      const lastName = nameParts.slice(1).join(' ') || 'User';

      const [profile] = await tx
        .insert(employeeProfiles)
        .values({
          userId: adminUser.id,
          organizationId: newOrg.id,
          employeeCode: 'EMP-00001',
          firstName,
          lastName,
          departmentId: dept.id,
          joiningDate: new Date().toISOString().slice(0, 10),
          employmentType: 'full_time',
          workLocation: 'office',
          compensationType: 'salaried',
          baseSalary: '10000.00',
          hourlyRate: '0.00',
          overtimeRateMultiplier: '1.50',
          standardWeeklyHours: '40.00',
        })
        .returning();

      // 8. Generate Tokens
      const tokenPayload = {
        userId: adminUser.id,
        organizationId: newOrg.id,
        email: adminUser.email,
        roles: ['super_admin'],
        permissions: ['*'],
      };
      const accessToken = AuthService.generateAccessToken(tokenPayload);

      const refreshTokenObj = await AuthService.issueRefreshToken(adminUser.id);

      return {
        organization: newOrg,
        adminUser: {
          id: adminUser.id,
          email: adminUser.email,
          name: `${profile.firstName} ${profile.lastName}`,
          role: 'super_admin',
        },
        tokens: {
          accessToken,
          refreshToken: refreshTokenObj.token,
        },
      };
    });
  }

  static async getDetails(organizationId: string) {
    const cacheKey = `org:${organizationId}:details`;

    return await CacheService.getOrSet(
      cacheKey,
      async () => {
        const [org] = await db
          .select()
          .from(organizations)
          .where(eq(organizations.id, organizationId))
          .limit(1);

        if (!org) return null;

        const deptList = await db
          .select()
          .from(departments)
          .where(eq(departments.organizationId, organizationId));

        const desigList = await db
          .select()
          .from(designations)
          .where(eq(designations.organizationId, organizationId));

        return {
          organization: org,
          departments: deptList,
          designations: desigList,
        };
      },
      3600 // 1 hour TTL
    );
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

    // Invalidate cached details
    await CacheService.del(`org:${organizationId}:details`);

    return updated;
  }
}

