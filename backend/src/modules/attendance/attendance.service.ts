import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { db } from '../../config/database';
import { attendanceRecords, employeeProfiles, departments } from '../../db/schema';

export class AttendanceService {
  static async getEmployeeAttendance(params: {
    employeeId: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) {
    const { employeeId, startDate, endDate, limit = 31, offset = 0 } = params;

    return await db
      .select()
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.employeeId, employeeId),
          startDate ? gte(attendanceRecords.attendanceDate, startDate) : undefined,
          endDate ? lte(attendanceRecords.attendanceDate, endDate) : undefined
        )
      )
      .orderBy(desc(attendanceRecords.attendanceDate))
      .limit(limit)
      .offset(offset);
  }

  static async getOrganizationDailyAttendance(params: {
    organizationId: string;
    date: string;
  }) {
    const { organizationId, date } = params;

    return await db
      .select({
        id: attendanceRecords.id,
        attendanceDate: attendanceRecords.attendanceDate,
        status: attendanceRecords.status,
        totalHoursWorked: attendanceRecords.totalHoursWorked,
        firstPunchIn: attendanceRecords.firstPunchIn,
        lastPunchOut: attendanceRecords.lastPunchOut,
        isLate: attendanceRecords.isLate,
        isOvertime: attendanceRecords.isOvertime,
        employeeId: employeeProfiles.id,
        employeeCode: employeeProfiles.employeeCode,
        firstName: employeeProfiles.firstName,
        lastName: employeeProfiles.lastName,
        departmentName: departments.name,
      })
      .from(attendanceRecords)
      .innerJoin(employeeProfiles, eq(attendanceRecords.employeeId, employeeProfiles.id))
      .leftJoin(departments, eq(employeeProfiles.departmentId, departments.id))
      .where(
        and(
          eq(attendanceRecords.organizationId, organizationId),
          eq(attendanceRecords.attendanceDate, date)
        )
      );
  }
}
