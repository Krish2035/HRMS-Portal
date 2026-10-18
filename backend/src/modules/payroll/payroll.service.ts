import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../config/database';
import { payrollPeriods, payrollRecords, employeeProfiles, organizations } from '../../db/schema';

export class PayrollService {
  static async listPeriods(organizationId: string) {
    return await db
      .select()
      .from(payrollPeriods)
      .where(eq(payrollPeriods.organizationId, organizationId))
      .orderBy(desc(payrollPeriods.startDate));
  }

  static async createPeriod(params: {
    organizationId: string;
    name: string;
    startDate: string;
    endDate: string;
  }) {
    const [period] = await db
      .insert(payrollPeriods)
      .values({
        organizationId: params.organizationId,
        name: params.name,
        startDate: params.startDate,
        endDate: params.endDate,
        status: 'draft',
      })
      .returning();

    return period;
  }

  static async generatePayrollRun(payrollPeriodId: string, organizationId: string) {
    const [period] = await db
      .select()
      .from(payrollPeriods)
      .where(and(eq(payrollPeriods.id, payrollPeriodId), eq(payrollPeriods.organizationId, organizationId)))
      .limit(1);

    if (!period) throw new Error('Payroll period not found');

    // Fetch all active employees
    const employees = await db
      .select()
      .from(employeeProfiles)
      .where(eq(employeeProfiles.organizationId, organizationId));

    return await db.transaction(async (tx) => {
      const records = [];

      for (const emp of employees) {
        // Base salary structure model
        const baseSalary = 5000.00;
        const allowances = 500.00; // Standard travel/wellness allowance
        const deductions = 350.00; // Tax/Insurance withholding
        const netSalary = baseSalary + allowances - deductions;

        const [rec] = await tx
          .insert(payrollRecords)
          .values({
            payrollPeriodId,
            employeeId: emp.id,
            baseSalary: baseSalary.toFixed(2),
            allowances: allowances.toFixed(2),
            deductions: deductions.toFixed(2),
            netSalary: netSalary.toFixed(2),
            status: 'pending',
          })
          .onConflictDoNothing()
          .returning();

        if (rec) records.push(rec);
      }

      await tx
        .update(payrollPeriods)
        .set({ status: 'processing' })
        .where(eq(payrollPeriods.id, payrollPeriodId));

      return records;
    });
  }

  static async getEmployeePayslips(employeeId: string) {
    return await db
      .select({
        id: payrollRecords.id,
        baseSalary: payrollRecords.baseSalary,
        allowances: payrollRecords.allowances,
        deductions: payrollRecords.deductions,
        netSalary: payrollRecords.netSalary,
        status: payrollRecords.status,
        paymentDate: payrollRecords.paymentDate,
        createdAt: payrollRecords.createdAt,
        periodName: payrollPeriods.name,
        startDate: payrollPeriods.startDate,
        endDate: payrollPeriods.endDate,
      })
      .from(payrollRecords)
      .innerJoin(payrollPeriods, eq(payrollRecords.payrollPeriodId, payrollPeriods.id))
      .where(eq(payrollRecords.employeeId, employeeId))
      .orderBy(desc(payrollPeriods.startDate));
  }

  static async finalizePeriod(payrollPeriodId: string) {
    const [updated] = await db
      .update(payrollPeriods)
      .set({ status: 'finalized' })
      .where(eq(payrollPeriods.id, payrollPeriodId))
      .returning();

    return updated;
  }

  static async getPayslipForPdf(payslipId: string) {
    const [record] = await db
      .select({
        payslipId: payrollRecords.id,
        baseSalary: payrollRecords.baseSalary,
        allowances: payrollRecords.allowances,
        deductions: payrollRecords.deductions,
        netSalary: payrollRecords.netSalary,
        status: payrollRecords.status,
        paymentDate: payrollRecords.paymentDate,
        employeeId: payrollRecords.employeeId,
        periodName: payrollPeriods.name,
        startDate: payrollPeriods.startDate,
        endDate: payrollPeriods.endDate,
        organizationId: payrollPeriods.organizationId,
        organizationName: organizations.name,
        employeeCode: employeeProfiles.employeeCode,
        firstName: employeeProfiles.firstName,
        lastName: employeeProfiles.lastName,
        workLocation: employeeProfiles.workLocation,
      })
      .from(payrollRecords)
      .innerJoin(payrollPeriods, eq(payrollRecords.payrollPeriodId, payrollPeriods.id))
      .innerJoin(employeeProfiles, eq(payrollRecords.employeeId, employeeProfiles.id))
      .innerJoin(organizations, eq(payrollPeriods.organizationId, organizations.id))
      .where(eq(payrollRecords.id, payslipId))
      .limit(1);

    if (!record) return null;

    return {
      organizationName: record.organizationName,
      periodName: record.periodName,
      startDate: record.startDate,
      endDate: record.endDate,
      employeeCode: record.employeeCode,
      employeeName: `${record.firstName} ${record.lastName}`,
      workLocation: record.workLocation || 'Corporate Headquarters',
      baseSalary: Number(record.baseSalary),
      allowances: Number(record.allowances),
      deductions: Number(record.deductions),
      netSalary: Number(record.netSalary),
      status: record.status,
      paymentDate: record.paymentDate,
      payslipId: record.payslipId,
      employeeId: record.employeeId,
      organizationId: record.organizationId,
    };
  }
}

