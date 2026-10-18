import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../config/database';
import { leaveTypes, leaveBalances, leaveRequests, employeeProfiles, users } from '../../db/schema';

export class LeaveService {
  static async getLeaveTypes(organizationId: string) {
    return await db
      .select()
      .from(leaveTypes)
      .where(eq(leaveTypes.organizationId, organizationId));
  }

  static async getBalances(employeeId: string, year = '2026') {
    return await db
      .select({
        id: leaveBalances.id,
        year: leaveBalances.year,
        allocatedDays: leaveBalances.allocatedDays,
        usedDays: leaveBalances.usedDays,
        pendingDays: leaveBalances.pendingDays,
        leaveTypeName: leaveTypes.name,
        leaveTypeCode: leaveTypes.code,
        isPaid: leaveTypes.isPaid,
      })
      .from(leaveBalances)
      .innerJoin(leaveTypes, eq(leaveBalances.leaveTypeId, leaveTypes.id))
      .where(and(eq(leaveBalances.employeeId, employeeId), eq(leaveBalances.year, year)));
  }

  static async submitRequest(params: {
    employeeId: string;
    organizationId: string;
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    daysCount: string;
    reason: string;
  }) {
    return await db.transaction(async (tx) => {
      const [newRequest] = await tx
        .insert(leaveRequests)
        .values({
          organizationId: params.organizationId,
          employeeId: params.employeeId,
          leaveTypeId: params.leaveTypeId,
          startDate: params.startDate,
          endDate: params.endDate,
          daysCount: params.daysCount,
          reason: params.reason,
          status: 'pending',
        })
        .returning();

      // Update pending days in balance
      const currentYear = params.startDate.split('-')[0] || '2026';
      const [balance] = await tx
        .select()
        .from(leaveBalances)
        .where(
          and(
            eq(leaveBalances.employeeId, params.employeeId),
            eq(leaveBalances.leaveTypeId, params.leaveTypeId),
            eq(leaveBalances.year, currentYear)
          )
        )
        .limit(1);

      if (balance) {
        const newPending = (Number(balance.pendingDays) + Number(params.daysCount)).toFixed(1);
        await tx
          .update(leaveBalances)
          .set({ pendingDays: newPending, updatedAt: new Date() })
          .where(eq(leaveBalances.id, balance.id));
      }

      return newRequest;
    });
  }

  static async listRequests(params: {
    organizationId: string;
    employeeId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const { organizationId, employeeId, status, limit = 50, offset = 0 } = params;

    return await db
      .select({
        id: leaveRequests.id,
        startDate: leaveRequests.startDate,
        endDate: leaveRequests.endDate,
        daysCount: leaveRequests.daysCount,
        reason: leaveRequests.reason,
        status: leaveRequests.status,
        createdAt: leaveRequests.createdAt,
        approverComment: leaveRequests.approverComment,
        leaveTypeName: leaveTypes.name,
        employeeName: employeeProfiles.firstName,
        employeeLastName: employeeProfiles.lastName,
        employeeCode: employeeProfiles.employeeCode,
      })
      .from(leaveRequests)
      .innerJoin(leaveTypes, eq(leaveRequests.leaveTypeId, leaveTypes.id))
      .innerJoin(employeeProfiles, eq(leaveRequests.employeeId, employeeProfiles.id))
      .where(
        and(
          eq(leaveRequests.organizationId, organizationId),
          employeeId ? eq(leaveRequests.employeeId, employeeId) : undefined,
          status ? eq(leaveRequests.status, status) : undefined
        )
      )
      .orderBy(desc(leaveRequests.createdAt))
      .limit(limit)
      .offset(offset);
  }

  static async reviewRequest(params: {
    requestId: string;
    approverId: string;
    status: 'approved' | 'rejected';
    approverComment?: string;
  }) {
    const { requestId, approverId, status, approverComment } = params;

    return await db.transaction(async (tx) => {
      const [req] = await tx
        .select()
        .from(leaveRequests)
        .where(eq(leaveRequests.id, requestId))
        .limit(1);

      if (!req) {
        throw new Error('Leave request not found');
      }

      if (req.status !== 'pending') {
        throw new Error(`Leave request has already been ${req.status}`);
      }

      const now = new Date();
      const [updated] = await tx
        .update(leaveRequests)
        .set({
          status,
          approverId,
          approverComment,
          reviewedAt: now,
          updatedAt: now,
        })
        .where(eq(leaveRequests.id, requestId))
        .returning();

      // Adjust leave balances atomically
      const year = req.startDate.split('-')[0] || '2026';
      const [balance] = await tx
        .select()
        .from(leaveBalances)
        .where(
          and(
            eq(leaveBalances.employeeId, req.employeeId),
            eq(leaveBalances.leaveTypeId, req.leaveTypeId),
            eq(leaveBalances.year, year)
          )
        )
        .limit(1);

      if (balance) {
        const days = Number(req.daysCount);
        const newPending = Math.max(0, Number(balance.pendingDays) - days).toFixed(1);
        const newUsed = status === 'approved' ? (Number(balance.usedDays) + days).toFixed(1) : balance.usedDays;

        await tx
          .update(leaveBalances)
          .set({
            pendingDays: newPending,
            usedDays: newUsed,
            updatedAt: now,
          })
          .where(eq(leaveBalances.id, balance.id));
      }

      return updated;
    });
  }
}
