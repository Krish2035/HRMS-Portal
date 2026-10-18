import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { db } from '../../config/database';
import { timesheets, workSessions, employeeProfiles, users, departments } from '../../db/schema';

export class TimesheetService {
  /**
   * Generates or syncs a weekly timesheet by aggregating completed work sessions
   */
  static async generateWeeklyTimesheet(params: {
    employeeId: string;
    organizationId: string;
    startDate: string; // "YYYY-MM-DD"
  }) {
    const { employeeId, organizationId, startDate } = params;

    // 1. Calculate 7-day end date
    const startObj = new Date(startDate);
    const endObj = new Date(startObj);
    endObj.setDate(endObj.getDate() + 6);
    const endDate = endObj.toISOString().slice(0, 10);

    // 2. Fetch employee profile for standard weekly hours (defaults to 40)
    const [employee] = await db
      .select({
        standardWeeklyHours: employeeProfiles.standardWeeklyHours,
        compensationType: employeeProfiles.compensationType,
      })
      .from(employeeProfiles)
      .where(eq(employeeProfiles.id, employeeId))
      .limit(1);

    const standardCap = employee ? Number(employee.standardWeeklyHours) : 40.0;

    // 3. Query all completed work sessions within the 7-day window
    const startWindow = new Date(`${startDate}T00:00:00Z`);
    const endWindow = new Date(`${endDate}T23:59:59Z`);

    const sessions = await db
      .select({
        durationSeconds: workSessions.netWorkDurationSeconds,
      })
      .from(workSessions)
      .where(
        and(
          eq(workSessions.employeeId, employeeId),
          gte(workSessions.startTime, startWindow),
          lte(workSessions.startTime, endWindow)
        )
      );

    const totalDurationSeconds = sessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);

    const totalHours = Math.round((totalDurationSeconds / 3600) * 100) / 100;

    const regularHours = Math.min(totalHours, standardCap);
    const overtimeHours = Math.max(0, totalHours - standardCap);

    // 4. Insert or Update draft timesheet
    const [existing] = await db
      .select()
      .from(timesheets)
      .where(and(eq(timesheets.employeeId, employeeId), eq(timesheets.periodStartDate, startDate)))
      .limit(1);

    if (existing) {
      if (existing.status !== 'draft' && existing.status !== 'rejected') {
        throw new Error(`Timesheet is already ${existing.status} and cannot be automatically re-generated.`);
      }

      const [updated] = await db
        .update(timesheets)
        .set({
          regularHours: regularHours.toFixed(2),
          overtimeHours: overtimeHours.toFixed(2),
          totalHours: totalHours.toFixed(2),
          status: 'draft',
          updatedAt: new Date(),
        })
        .where(eq(timesheets.id, existing.id))
        .returning();

      return updated;
    }

    const [created] = await db
      .insert(timesheets)
      .values({
        organizationId,
        employeeId,
        periodStartDate: startDate,
        periodEndDate: endDate,
        regularHours: regularHours.toFixed(2),
        overtimeHours: overtimeHours.toFixed(2),
        totalHours: totalHours.toFixed(2),
        status: 'draft',
      })
      .returning();

    return created;
  }

  /**
   * Employee submits draft or rejected timesheet to their manager
   */
  static async submitTimesheet(timesheetId: string, employeeId: string) {
    const [sheet] = await db
      .select()
      .from(timesheets)
      .where(and(eq(timesheets.id, timesheetId), eq(timesheets.employeeId, employeeId)))
      .limit(1);

    if (!sheet) throw new Error('Timesheet not found');
    if (sheet.status !== 'draft' && sheet.status !== 'rejected') {
      throw new Error(`Timesheet is already in '${sheet.status}' state`);
    }

    const [updated] = await db
      .update(timesheets)
      .set({
        status: 'submitted',
        submittedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(timesheets.id, timesheetId))
      .returning();

    return updated;
  }

  /**
   * Manager / HR Admin approves or rejects the submitted timesheet
   */
  static async reviewTimesheet(params: {
    timesheetId: string;
    reviewerEmployeeId: string;
    organizationId: string;
    action: 'approve' | 'reject';
    rejectionReason?: string;
  }) {
    const { timesheetId, reviewerEmployeeId, action, rejectionReason } = params;

    const [sheet] = await db
      .select()
      .from(timesheets)
      .where(eq(timesheets.id, timesheetId))
      .limit(1);

    if (!sheet) throw new Error('Timesheet not found');
    if (sheet.status !== 'submitted') {
      throw new Error(`Cannot review timesheet in '${sheet.status}' state. Must be 'submitted'.`);
    }

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const [updated] = await db
      .update(timesheets)
      .set({
        status: newStatus,
        reviewedBy: reviewerEmployeeId,
        reviewedAt: new Date(),
        rejectionReason: action === 'reject' ? (rejectionReason || 'Timesheet rejected by manager') : null,
        updatedAt: new Date(),
      })
      .where(eq(timesheets.id, timesheetId))
      .returning();

    return updated;
  }

  /**
   * List pending timesheets for manager review
   */
  static async listPendingTimesheets(organizationId: string) {
    return await db
      .select({
        id: timesheets.id,
        periodStartDate: timesheets.periodStartDate,
        periodEndDate: timesheets.periodEndDate,
        regularHours: timesheets.regularHours,
        overtimeHours: timesheets.overtimeHours,
        totalHours: timesheets.totalHours,
        status: timesheets.status,
        submittedAt: timesheets.submittedAt,
        employeeId: employeeProfiles.id,
        employeeCode: employeeProfiles.employeeCode,
        firstName: employeeProfiles.firstName,
        lastName: employeeProfiles.lastName,
        email: users.email,
        compensationType: employeeProfiles.compensationType,
        hourlyRate: employeeProfiles.hourlyRate,
        overtimeMultiplier: employeeProfiles.overtimeRateMultiplier,
        departmentName: departments.name,
      })
      .from(timesheets)
      .innerJoin(employeeProfiles, eq(timesheets.employeeId, employeeProfiles.id))
      .innerJoin(users, eq(employeeProfiles.userId, users.id))
      .leftJoin(departments, eq(employeeProfiles.departmentId, departments.id))
      .where(and(eq(timesheets.organizationId, organizationId), eq(timesheets.status, 'submitted')))
      .orderBy(desc(timesheets.submittedAt));
  }

  /**
   * Get employee's timesheets history
   */
  static async listEmployeeTimesheets(employeeId: string) {
    return await db
      .select()
      .from(timesheets)
      .where(eq(timesheets.employeeId, employeeId))
      .orderBy(desc(timesheets.periodStartDate));
  }
}
