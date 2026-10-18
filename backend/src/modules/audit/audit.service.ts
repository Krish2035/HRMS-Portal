import { eq, desc } from 'drizzle-orm';
import { db } from '../../config/database';
import { auditLogs, users } from '../../db/schema';

export class AuditService {
  static async record(params: {
    organizationId: string;
    actorId?: string;
    action: string;
    entityType: string;
    entityId?: string;
    ipAddress?: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
  }) {
    try {
      const [log] = await db
        .insert(auditLogs)
        .values({
          organizationId: params.organizationId,
          actorId: params.actorId,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          ipAddress: params.ipAddress,
          oldValues: params.oldValues || null,
          newValues: params.newValues || null,
        })
        .returning();

      return log;
    } catch (err) {
      // Never crash the primary business request if audit write fails
      console.error('Audit log write error:', err);
      return null;
    }
  }

  static async listLogs(organizationId: string, limit = 50, offset = 0) {
    return await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        entityId: auditLogs.entityId,
        ipAddress: auditLogs.ipAddress,
        oldValues: auditLogs.oldValues,
        newValues: auditLogs.newValues,
        createdAt: auditLogs.createdAt,
        actorEmail: users.email,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.actorId, users.id))
      .where(eq(auditLogs.organizationId, organizationId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);
  }
}
