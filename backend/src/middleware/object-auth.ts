import { Request, Response, NextFunction } from 'express';
import { eq, and } from 'drizzle-orm';
import { db } from '../config/database';
import {
  workSessions,
  leaveRequests,
  employeeProfiles,
  employeeManagers,
  timesheets,
  attendanceRecords,
} from '../db/schema';
import { AuditService } from '../modules/audit/audit.service';

export type ProtectedResource =
  | 'work_sessions'
  | 'leave_requests'
  | 'employee_profiles'
  | 'timesheets'
  | 'attendance_records';

export interface IdorRolaOptions {
  resource: ProtectedResource;
  idParam?: string; // Default: 'id'
  ownershipField?: 'employeeId' | 'userId';
  allowRoles?: string[]; // Roles that have organizational authority (e.g., ['super_admin', 'hr_admin'])
  checkManagerRelationship?: boolean; // If true, managers must be the direct manager or department lead of the employee
  allowSelf?: boolean; // If true, employees can access their own object
}

/**
 * Enterprise IDOR (Insecure Direct Object Reference) and
 * ROLA (Role & Object-Level Authorization) Protection Middleware
 */
export function protectIdorAndRola(options: IdorRolaOptions) {
  const {
    resource,
    idParam = 'id',
    ownershipField = 'employeeId',
    allowRoles = ['super_admin', 'hr_admin'],
    checkManagerRelationship = true,
    allowSelf = true,
  } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = req.user;
    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required for protected resource',
          requestId: req.headers['x-request-id'],
        },
      });
      return;
    }

    const targetId = req.params[idParam];
    if (!targetId) {
      // If no ID param is in URL, proceed
      next();
      return;
    }

    try {
      // 1. Fetch resource and verify multi-tenant isolation (Anti-IDOR)
      let record: Record<string, unknown> | null = null;

      if (resource === 'work_sessions') {
        const [found] = await db
          .select()
          .from(workSessions)
          .where(eq(workSessions.id, targetId))
          .limit(1);
        record = (found as Record<string, unknown>) || null;
      } else if (resource === 'leave_requests') {
        const [found] = await db
          .select()
          .from(leaveRequests)
          .where(eq(leaveRequests.id, targetId))
          .limit(1);
        record = (found as Record<string, unknown>) || null;
      } else if (resource === 'employee_profiles') {
        const [found] = await db
          .select()
          .from(employeeProfiles)
          .where(eq(employeeProfiles.id, targetId))
          .limit(1);
        record = (found as Record<string, unknown>) || null;
      } else if (resource === 'timesheets') {
        const [found] = await db
          .select()
          .from(timesheets)
          .where(eq(timesheets.id, targetId))
          .limit(1);
        record = (found as Record<string, unknown>) || null;
      } else if (resource === 'attendance_records') {
        const [found] = await db
          .select()
          .from(attendanceRecords)
          .where(eq(attendanceRecords.id, targetId))
          .limit(1);
        record = (found as Record<string, unknown>) || null;
      }

      // If object doesn't exist, return 404 (not disclosing cross-tenant existence)
      if (!record) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `${resource.replace('_', ' ')} record not found`,
            requestId: req.headers['x-request-id'],
          },
        });
        return;
      }

      // 2. IDOR Check: Multi-Tenant Boundary Enforcement
      const recordOrgId = record.organizationId as string | undefined;
      if (recordOrgId && recordOrgId !== user.organizationId) {
        // Direct Object Reference Cross-Tenant Violation Detected!
        await AuditService.record({
          organizationId: user.organizationId,
          actorId: user.userId,
          action: 'SECURITY_ALERT:IDOR_CROSS_TENANT_VIOLATION',
          entityType: resource,
          entityId: targetId,
          ipAddress: req.ip,
          oldValues: {
            attemptedTargetOrgId: recordOrgId,
            userOrgId: user.organizationId,
            path: req.originalUrl,
          },
        });

        res.status(403).json({
          success: false,
          error: {
            code: 'IDOR_ACCESS_DENIED',
            message: 'Insecure Direct Object Reference: Access to cross-tenant entity is strictly prohibited',
            requestId: req.headers['x-request-id'],
          },
        });
        return;
      }

      // 3. ROLA Check: Role & Object-Level Authorization
      // Super admin has full tenant authority
      if (user.roles.includes('super_admin') || user.roles.some((r) => allowRoles.includes(r))) {
        next();
        return;
      }

      // Resolve caller's employee profile
      const [callerProfile] = await db
        .select({ id: employeeProfiles.id, departmentId: employeeProfiles.departmentId })
        .from(employeeProfiles)
        .where(eq(employeeProfiles.userId, user.userId))
        .limit(1);

      const callerEmployeeId = callerProfile?.id;

      // Self-Ownership Check (if employee accessing their own record)
      if (allowSelf) {
        const recordOwnerId =
          ownershipField === 'userId'
            ? (record.userId as string | undefined)
            : (record.employeeId as string | undefined);

        if (
          (ownershipField === 'userId' && recordOwnerId === user.userId) ||
          (ownershipField === 'employeeId' && recordOwnerId === callerEmployeeId) ||
          (resource === 'employee_profiles' && record.id === callerEmployeeId)
        ) {
          next();
          return;
        }
      }

      // Manager Contextual Hierarchy Check (ROLA)
      if (user.roles.includes('manager') && checkManagerRelationship && callerEmployeeId) {
        const targetEmployeeId =
          resource === 'employee_profiles'
            ? (record.id as string)
            : (record.employeeId as string | undefined);

        if (targetEmployeeId) {
          // Check 1: Is caller designated as direct manager in employee_managers table?
          const [managerRel] = await db
            .select()
            .from(employeeManagers)
            .where(
              and(
                eq(employeeManagers.employeeId, targetEmployeeId),
                eq(employeeManagers.managerId, callerEmployeeId)
              )
            )
            .limit(1);

          if (managerRel) {
            next();
            return;
          }

          // Check 2: Does target employee share the manager's department?
          const [targetProfile] = await db
            .select({ departmentId: employeeProfiles.departmentId })
            .from(employeeProfiles)
            .where(eq(employeeProfiles.id, targetEmployeeId))
            .limit(1);

          if (
            callerProfile?.departmentId &&
            targetProfile?.departmentId &&
            callerProfile.departmentId === targetProfile.departmentId
          ) {
            next();
            return;
          }
        }

        // Manager is not in the reporting chain for this specific object
        await AuditService.record({
          organizationId: user.organizationId,
          actorId: user.userId,
          action: 'SECURITY_ALERT:ROLA_UNAUTHORIZED_OBJECT_ACCESS',
          entityType: resource,
          entityId: targetId,
          ipAddress: req.ip,
          oldValues: {
            managerEmployeeId: callerEmployeeId,
            targetEmployeeId,
            reason: 'Caller is not the designated manager or department lead for this entity',
          },
        });

        res.status(403).json({
          success: false,
          error: {
            code: 'ROLA_OBJECT_AUTHORIZATION_FAILED',
            message:
              'Role-Object Level Authorization failed: You do not possess management authority over this specific employee',
            requestId: req.headers['x-request-id'],
          },
        });
        return;
      }

      // Generic IDOR Ownership Violation (e.g. Employee accessing another employee's object)
      await AuditService.record({
        organizationId: user.organizationId,
        actorId: user.userId,
        action: 'SECURITY_ALERT:IDOR_DIRECT_REFERENCE_BLOCKED',
        entityType: resource,
        entityId: targetId,
        ipAddress: req.ip,
      });

      res.status(403).json({
        success: false,
        error: {
          code: 'IDOR_OWNERSHIP_VIOLATION',
          message: 'Direct Object Reference blocked: You do not have ownership of this resource',
          requestId: req.headers['x-request-id'],
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
