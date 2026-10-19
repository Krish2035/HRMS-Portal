import { db, pool } from '../config/database';
import { AuthService } from '../modules/auth/auth.service';
import { logger } from '../config/logger';
import {
  organizations,
  roles,
  permissions,
  rolePermissions,
  users,
  userRoles,
  departments,
  designations,
  employeeProfiles,
  employeeManagers,
  leaveTypes,
  leaveBalances,
} from './schema';
import { eq } from 'drizzle-orm';

export async function seedDatabase() {
  logger.info('🌱 Starting HRMS seed data generation...');

  try {
    // 1. Create Organization
    const [existingOrg] = await db.select().from(organizations).where(eq(organizations.code, 'ACME')).limit(1);
    let orgId: string;

    if (!existingOrg) {
      const [newOrg] = await db
        .insert(organizations)
        .values({
          name: 'ACME Global Technologies',
          code: 'ACME',
          timeZone: 'UTC',
          organizationScale: 'growing',
          enabledModules: {
            time_tracking: true,
            attendance: true,
            leaves: true,
            timesheets: true,
            payroll: true,
            performance: false,
            audit: true,
          },
          workDayHours: '8.00',
          allowBreaks: true,
          maxBreakMinutes: 60,
        })
        .returning();
      orgId = newOrg.id;
      logger.info('Created organization: ACME Global Technologies');
    } else {
      orgId = existingOrg.id;
    }

    // 2. Roles
    const roleDefinitions = [
      { name: 'Super Admin', slug: 'super_admin', description: 'Full system administrative access', isSystemRole: true },
      { name: 'HR Admin', slug: 'hr_admin', description: 'Human resources administration and payroll', isSystemRole: true },
      { name: 'Manager', slug: 'manager', description: 'Team lead with approval permissions', isSystemRole: false },
      { name: 'Employee', slug: 'employee', description: 'Standard employee portal access', isSystemRole: false },
    ];

    const roleMap = new Map<string, string>();
    for (const r of roleDefinitions) {
      const [existing] = await db.select().from(roles).where(eq(roles.slug, r.slug)).limit(1);
      if (!existing) {
        const [inserted] = await db
          .insert(roles)
          .values({
            organizationId: orgId,
            ...r,
          })
          .returning();
        roleMap.set(r.slug, inserted.id);
      } else {
        roleMap.set(r.slug, existing.id);
      }
    }
    logger.info('Roles seeded successfully');

    // 3. Departments
    const deptData = [
      { name: 'Engineering', code: 'ENG', description: 'Software Development and DevOps' },
      { name: 'Product & Design', code: 'PRD', description: 'Product Management and UI/UX' },
      { name: 'Human Resources', code: 'HR', description: 'People Operations and Talent' },
      { name: 'Finance', code: 'FIN', description: 'Accounting and Financial Planning' },
    ];

    const deptMap = new Map<string, string>();
    for (const d of deptData) {
      const [existing] = await db.select().from(departments).where(eq(departments.code, d.code)).limit(1);
      if (!existing) {
        const [inserted] = await db.insert(departments).values({ organizationId: orgId, ...d }).returning();
        deptMap.set(d.code, inserted.id);
      } else {
        deptMap.set(d.code, existing.id);
      }
    }

    // 4. Designations
    const desigData = [
      { name: 'VP of Engineering', code: 'VPE', description: 'Engineering Leadership' },
      { name: 'Staff Software Engineer', code: 'SSE', description: 'Senior Technical Lead' },
      { name: 'Full-Stack Engineer', code: 'FSE', description: 'Core Application Developer' },
      { name: 'HR Director', code: 'HRD', description: 'Head of People Operations' },
    ];

    const desigMap = new Map<string, string>();
    for (const d of desigData) {
      const [existing] = await db.select().from(designations).where(eq(designations.code, d.code)).limit(1);
      if (!existing) {
        const [inserted] = await db.insert(designations).values({ organizationId: orgId, ...d }).returning();
        desigMap.set(d.code, inserted.id);
      } else {
        desigMap.set(d.code, existing.id);
      }
    }

    // 5. Leave Types
    const leaveTypeData = [
      { name: 'Annual Leave', code: 'AL', daysPerYear: '18.0', isPaid: 'true' },
      { name: 'Sick Leave', code: 'SL', daysPerYear: '10.0', isPaid: 'true' },
      { name: 'Casual Leave', code: 'CL', daysPerYear: '6.0', isPaid: 'true' },
      { name: 'Unpaid Leave', code: 'UL', daysPerYear: '30.0', isPaid: 'false' },
    ];

    const leaveTypeMap = new Map<string, string>();
    for (const lt of leaveTypeData) {
      const [existing] = await db.select().from(leaveTypes).where(eq(leaveTypes.code, lt.code)).limit(1);
      if (!existing) {
        const [inserted] = await db.insert(leaveTypes).values({ organizationId: orgId, ...lt }).returning();
        leaveTypeMap.set(lt.code, inserted.id);
      } else {
        leaveTypeMap.set(lt.code, existing.id);
      }
    }

    // 6. Users & Employee Profiles
    const defaultPassword = 'Password123!';
    const passwordHash = await AuthService.hashPassword(defaultPassword);

    const seedUsers = [
      {
        email: 'admin@hrms.internal',
        role: 'super_admin',
        empCode: 'EMP001',
        firstName: 'System',
        lastName: 'Administrator',
        dept: 'HR',
        desig: 'HRD',
      },
      {
        email: 'manager@hrms.internal',
        role: 'manager',
        empCode: 'EMP002',
        firstName: 'Sarah',
        lastName: 'Connor',
        dept: 'ENG',
        desig: 'VPE',
      },
      {
        email: 'krish@hrms.internal',
        role: 'employee',
        empCode: 'EMP003',
        firstName: 'Krish',
        lastName: 'Patel',
        dept: 'ENG',
        desig: 'FSE',
      },
    ];

    const empProfiles: { id: string; email: string }[] = [];

    for (const u of seedUsers) {
      let [existingUser] = await db.select().from(users).where(eq(users.email, u.email)).limit(1);
      if (!existingUser) {
        [existingUser] = await db
          .insert(users)
          .values({
            organizationId: orgId,
            email: u.email,
            passwordHash,
            status: 'active',
          })
          .returning();

        // Assign role
        const roleId = roleMap.get(u.role);
        if (roleId) {
          await db.insert(userRoles).values({ userId: existingUser.id, roleId }).onConflictDoNothing();
        }

        // Create Employee Profile
        const [profile] = await db
          .insert(employeeProfiles)
          .values({
            userId: existingUser.id,
            organizationId: orgId,
            employeeCode: u.empCode,
            firstName: u.firstName,
            lastName: u.lastName,
            phone: '+1-555-0199',
            departmentId: deptMap.get(u.dept) || null,
            designationId: desigMap.get(u.desig) || null,
            joiningDate: '2024-01-15',
            employmentType: 'full_time',
            workLocation: 'hybrid',
          })
          .returning();

        empProfiles.push({ id: profile.id, email: u.email });

        // Initialize leave balances for 2026
        for (const [code, ltId] of leaveTypeMap.entries()) {
          const quota = code === 'AL' ? '18.0' : code === 'SL' ? '10.0' : code === 'CL' ? '6.0' : '30.0';
          await db
            .insert(leaveBalances)
            .values({
              employeeId: profile.id,
              leaveTypeId: ltId,
              year: '2026',
              allocatedDays: quota,
              usedDays: '0.0',
              pendingDays: '0.0',
            })
            .onConflictDoNothing();
        }
      }
    }

    // Set Manager Reporting: Krish reports to Sarah Connor
    const managerProfile = empProfiles.find((e) => e.email === 'manager@hrms.internal');
    const krishProfile = empProfiles.find((e) => e.email === 'krish@hrms.internal');

    if (managerProfile && krishProfile) {
      await db
        .insert(employeeManagers)
        .values({
          employeeId: krishProfile.id,
          managerId: managerProfile.id,
          isPrimary: true,
        })
        .onConflictDoNothing();
      logger.info('Configured reporting hierarchy: Krish Patel -> Sarah Connor');
    }

    logger.info('✅ HRMS Database seed completed successfully!');
    logger.info('Credentials:');
    logger.info('  Admin:    admin@hrms.internal / Password123!');
    logger.info('  Manager:  manager@hrms.internal / Password123!');
    logger.info('  Employee: krish@hrms.internal / Password123!');
  } catch (error) {
    logger.error({ error }, '❌ Database seeding failed');
    throw error;
  }
}

// Direct execution support via tsx
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  seedDatabase()
    .then(() => pool.end())
    .catch(() => process.exit(1));
}
