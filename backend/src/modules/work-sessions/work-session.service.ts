import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../../config/database';
import {
  workSessions,
  breakRecords,
  workSessionEvents,
  timeCorrectionRequests,
  attendanceRecords,
  employeeProfiles,
} from '../../db/schema';

export class WorkSessionService {
  /**
   * Start a work session (Transaction-safe & Idempotent)
   */
  static async startSession(params: {
    organizationId: string;
    employeeId: string;
    actorUserId: string;
    ipAddress?: string;
    userAgent?: string;
    notes?: string;
  }) {
    const { organizationId, employeeId, actorUserId, ipAddress, userAgent, notes } = params;

    // Check if an active session already exists for this employee
    const [existingSession] = await db
      .select()
      .from(workSessions)
      .where(
        and(
          eq(workSessions.employeeId, employeeId),
          sql`${workSessions.status} IN ('running', 'paused')`
        )
      )
      .limit(1);

    if (existingSession) {
      // Idempotency: Return existing session rather than throwing or creating duplicate
      return {
        session: existingSession,
        alreadyActive: true,
      };
    }

    const now = new Date();

    const result = await db.transaction(async (tx) => {
      const [newSession] = await tx
        .insert(workSessions)
        .values({
          organizationId,
          employeeId,
          status: 'running',
          startTime: now,
          totalBreakDurationSeconds: 0,
          netWorkDurationSeconds: 0,
          ipAddress,
          userAgent,
          notes,
        })
        .returning();

      await tx.insert(workSessionEvents).values({
        workSessionId: newSession.id,
        eventType: 'started',
        eventTime: now,
        actorId: actorUserId,
        metadata: { ipAddress, userAgent },
      });

      // Upsert daily attendance record
      const today = now.toISOString().split('T')[0];
      await tx
        .insert(attendanceRecords)
        .values({
          organizationId,
          employeeId,
          attendanceDate: today,
          status: 'present',
          firstPunchIn: now,
        })
        .onConflictDoNothing();

      return newSession;
    });

    return {
      session: result,
      alreadyActive: false,
    };
  }

  /**
   * Pause a running work session
   */
  static async pauseSession(params: {
    sessionId: string;
    employeeId: string;
    actorUserId: string;
    breakType?: string;
    reason?: string;
  }) {
    const { sessionId, employeeId, actorUserId, breakType = 'general', reason } = params;

    const [session] = await db
      .select()
      .from(workSessions)
      .where(and(eq(workSessions.id, sessionId), eq(workSessions.employeeId, employeeId)))
      .limit(1);

    if (!session) {
      throw new Error('Work session not found');
    }

    if (session.status !== 'running') {
      throw new Error(`Cannot pause session that is currently in '${session.status}' state`);
    }

    const now = new Date();

    return await db.transaction(async (tx) => {
      const [updatedSession] = await tx
        .update(workSessions)
        .set({ status: 'paused', updatedAt: now })
        .where(eq(workSessions.id, sessionId))
        .returning();

      const [breakRecord] = await tx
        .insert(breakRecords)
        .values({
          workSessionId: sessionId,
          breakType,
          startTime: now,
          reason,
        })
        .returning();

      await tx.insert(workSessionEvents).values({
        workSessionId: sessionId,
        eventType: 'paused',
        eventTime: now,
        actorId: actorUserId,
        metadata: { breakId: breakRecord.id, breakType, reason },
      });

      return { session: updatedSession, breakRecord };
    });
  }

  /**
   * Resume a paused work session
   */
  static async resumeSession(params: {
    sessionId: string;
    employeeId: string;
    actorUserId: string;
  }) {
    const { sessionId, employeeId, actorUserId } = params;

    const [session] = await db
      .select()
      .from(workSessions)
      .where(and(eq(workSessions.id, sessionId), eq(workSessions.employeeId, employeeId)))
      .limit(1);

    if (!session) {
      throw new Error('Work session not found');
    }

    if (session.status !== 'paused') {
      throw new Error(`Cannot resume session that is in '${session.status}' state`);
    }

    const now = new Date();

    return await db.transaction(async (tx) => {
      // Find open break record
      const [openBreak] = await tx
        .select()
        .from(breakRecords)
        .where(and(eq(breakRecords.workSessionId, sessionId), sql`${breakRecords.endTime} IS NULL`))
        .orderBy(desc(breakRecords.startTime))
        .limit(1);

      let addedBreakSeconds = 0;
      if (openBreak) {
        addedBreakSeconds = Math.max(0, Math.floor((now.getTime() - openBreak.startTime.getTime()) / 1000));
        await tx
          .update(breakRecords)
          .set({
            endTime: now,
            durationSeconds: addedBreakSeconds,
          })
          .where(eq(breakRecords.id, openBreak.id));
      }

      const newTotalBreaks = session.totalBreakDurationSeconds + addedBreakSeconds;

      const [updatedSession] = await tx
        .update(workSessions)
        .set({
          status: 'running',
          totalBreakDurationSeconds: newTotalBreaks,
          updatedAt: now,
        })
        .where(eq(workSessions.id, sessionId))
        .returning();

      await tx.insert(workSessionEvents).values({
        workSessionId: sessionId,
        eventType: 'resumed',
        eventTime: now,
        actorId: actorUserId,
        metadata: { addedBreakSeconds, totalBreakDurationSeconds: newTotalBreaks },
      });

      return updatedSession;
    });
  }

  /**
   * End a work session and finalize net duration
   */
  static async endSession(params: {
    sessionId: string;
    employeeId: string;
    actorUserId: string;
    notes?: string;
  }) {
    const { sessionId, employeeId, actorUserId, notes } = params;

    const [session] = await db
      .select()
      .from(workSessions)
      .where(and(eq(workSessions.id, sessionId), eq(workSessions.employeeId, employeeId)))
      .limit(1);

    if (!session) {
      throw new Error('Work session not found');
    }

    if (session.status === 'completed') {
      return session; // Idempotent
    }

    const now = new Date();

    return await db.transaction(async (tx) => {
      let finalTotalBreaks = session.totalBreakDurationSeconds;

      // Close open break if session was paused when ended
      if (session.status === 'paused') {
        const [openBreak] = await tx
          .select()
          .from(breakRecords)
          .where(and(eq(breakRecords.workSessionId, sessionId), sql`${breakRecords.endTime} IS NULL`))
          .orderBy(desc(breakRecords.startTime))
          .limit(1);

        if (openBreak) {
          const breakSecs = Math.max(0, Math.floor((now.getTime() - openBreak.startTime.getTime()) / 1000));
          await tx
            .update(breakRecords)
            .set({ endTime: now, durationSeconds: breakSecs })
            .where(eq(breakRecords.id, openBreak.id));
          finalTotalBreaks += breakSecs;
        }
      }

      const totalSpanSeconds = Math.max(0, Math.floor((now.getTime() - session.startTime.getTime()) / 1000));
      const netWorkDurationSeconds = Math.max(0, totalSpanSeconds - finalTotalBreaks);

      const [completedSession] = await tx
        .update(workSessions)
        .set({
          status: 'completed',
          endTime: now,
          totalBreakDurationSeconds: finalTotalBreaks,
          netWorkDurationSeconds,
          notes: notes || session.notes,
          updatedAt: now,
        })
        .where(eq(workSessions.id, sessionId))
        .returning();

      await tx.insert(workSessionEvents).values({
        workSessionId: sessionId,
        eventType: 'ended',
        eventTime: now,
        actorId: actorUserId,
        metadata: { netWorkDurationSeconds, finalTotalBreaks },
      });

      // Update today's attendance record with punch out and hours
      const today = now.toISOString().split('T')[0];
      const hoursWorked = (netWorkDurationSeconds / 3600).toFixed(2);
      await tx
        .update(attendanceRecords)
        .set({
          lastPunchOut: now,
          totalHoursWorked: hoursWorked,
          updatedAt: now,
        })
        .where(
          and(
            eq(attendanceRecords.employeeId, employeeId),
            eq(attendanceRecords.attendanceDate, today)
          )
        );

      return completedSession;
    });
  }

  /**
   * Get active work session and real-time elapsed seconds calculated deterministically
   */
  static async getCurrentSession(employeeId: string) {
    const [session] = await db
      .select()
      .from(workSessions)
      .where(
        and(
          eq(workSessions.employeeId, employeeId),
          sql`${workSessions.status} IN ('running', 'paused')`
        )
      )
      .limit(1);

    if (!session) {
      return {
        hasActiveSession: false,
        session: null,
        elapsedSeconds: 0,
      };
    }

    const now = new Date();
    let currentElapsed = 0;

    if (session.status === 'running') {
      const totalSpan = Math.max(0, Math.floor((now.getTime() - session.startTime.getTime()) / 1000));
      currentElapsed = Math.max(0, totalSpan - session.totalBreakDurationSeconds);
    } else if (session.status === 'paused') {
      // Find open break start time
      const [openBreak] = await db
        .select()
        .from(breakRecords)
        .where(and(eq(breakRecords.workSessionId, session.id), sql`${breakRecords.endTime} IS NULL`))
        .orderBy(desc(breakRecords.startTime))
        .limit(1);

      const freezeTime = openBreak ? openBreak.startTime : now;
      const totalSpan = Math.max(0, Math.floor((freezeTime.getTime() - session.startTime.getTime()) / 1000));
      currentElapsed = Math.max(0, totalSpan - session.totalBreakDurationSeconds);
    }

    return {
      hasActiveSession: true,
      session,
      elapsedSeconds: currentElapsed,
    };
  }

  /**
   * Get summary of today's and weekly tracked hours
   */
  static async getSummary(employeeId: string) {
    const today = new Date().toISOString().split('T')[0];

    // Today's completed sessions
    const sessionsToday = await db
      .select()
      .from(workSessions)
      .where(
        and(
          eq(workSessions.employeeId, employeeId),
          sql`DATE(start_time) = ${today}`
        )
      );

    let todayTrackedSeconds = 0;
    let todayBreakSeconds = 0;

    const current = await this.getCurrentSession(employeeId);
    if (current.hasActiveSession) {
      todayTrackedSeconds += current.elapsedSeconds;
      todayBreakSeconds += current.session?.totalBreakDurationSeconds || 0;
    }

    for (const s of sessionsToday) {
      if (s.status === 'completed') {
        todayTrackedSeconds += s.netWorkDurationSeconds;
        todayBreakSeconds += s.totalBreakDurationSeconds;
      }
    }

    return {
      today: {
        trackedSeconds: todayTrackedSeconds,
        breakSeconds: todayBreakSeconds,
        formattedTracked: `${Math.floor(todayTrackedSeconds / 3600)}h ${Math.floor((todayTrackedSeconds % 3600) / 60)}m`,
      },
      currentSession: current,
    };
  }

  /**
   * List paginated work session history
   */
  static async getHistory(employeeId: string, limit = 20, offset = 0) {
    const sessions = await db
      .select()
      .from(workSessions)
      .where(eq(workSessions.employeeId, employeeId))
      .orderBy(desc(workSessions.startTime))
      .limit(limit)
      .offset(offset);

    return sessions;
  }

  /**
   * Submit a manual time correction request
   */
  static async submitCorrectionRequest(params: {
    workSessionId: string;
    employeeId: string;
    proposedStartTime: Date;
    proposedEndTime: Date;
    reason: string;
  }) {
    const [request] = await db
      .insert(timeCorrectionRequests)
      .values(params)
      .returning();

    return request;
  }
}
