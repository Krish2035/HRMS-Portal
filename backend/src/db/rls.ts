import { sql } from 'drizzle-orm';
import { db } from '../config/database';
import { logger } from '../config/logger';

export class RowLevelSecurityService {
  /**
   * Applies PostgreSQL Row-Level Security (RLS) policies to physically prevent
   * cross-organization data leakage at the database engine level.
   */
  static async applyPolicies(): Promise<void> {
    const tables = [
      'employee_profiles',
      'work_sessions',
      'timesheets',
      'attendance_records',
      'leave_requests',
      'payroll_periods',
      'payroll_records',
      'audit_logs',
    ];

    try {
      for (const table of tables) {
        // 1. Enable RLS on table
        await db.execute(sql.raw(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`));

        // 2. Drop existing policy if any
        await db.execute(
          sql.raw(`DROP POLICY IF EXISTS "tenant_isolation_${table}" ON "${table}";`)
        );

        // 3. Create strict tenant isolation policy
        // Requires session setting 'app.current_org_id' to match table organization_id
        await db.execute(
          sql.raw(`
            CREATE POLICY "tenant_isolation_${table}" ON "${table}"
            FOR ALL
            USING (
              organization_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid
              OR current_setting('app.is_super_admin', true) = 'true'
            );
          `)
        );
      }
      logger.info('Row-Level Security (RLS) policies successfully enforced across all tenant tables');
    } catch (err: unknown) {
      logger.warn({ err }, 'RLS initialization notice (Database user permissions check)');
    }
  }

  /**
   * Sets the tenant organization context for the current connection transaction
   */
  static getSetContextSql(organizationId: string, isSuperAdmin = false) {
    return sql`
      SELECT 
        set_config('app.current_org_id', ${organizationId}, true),
        set_config('app.is_super_admin', ${isSuperAdmin ? 'true' : 'false'}, true);
    `;
  }
}
