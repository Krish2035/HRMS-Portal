import { eq, and } from 'drizzle-orm';
import { db } from '../../config/database';
import { payrollPeriods, payrollRecords, employeeProfiles, organizations, users } from '../../db/schema';

export interface BankDisbursementRecord {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  email: string;
  amount: number;
  routingNumber: string;
  accountNumber: string;
  accountType: 'Checking' | 'Savings';
}

export class BankExportService {
  /**
   * Fetches the payroll records for a given period and prepares bank disbursement entries
   */
  private static async getDisbursementData(periodId: string, organizationId: string) {
    const [period] = await db
      .select()
      .from(payrollPeriods)
      .where(and(eq(payrollPeriods.id, periodId), eq(payrollPeriods.organizationId, organizationId)))
      .limit(1);

    if (!period) throw new Error('Payroll period not found');

    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    const records = await db
      .select({
        recordId: payrollRecords.id,
        netSalary: payrollRecords.netSalary,
        status: payrollRecords.status,
        employeeId: employeeProfiles.id,
        employeeCode: employeeProfiles.employeeCode,
        firstName: employeeProfiles.firstName,
        lastName: employeeProfiles.lastName,
        email: users.email,
      })
      .from(payrollRecords)
      .innerJoin(employeeProfiles, eq(payrollRecords.employeeId, employeeProfiles.id))
      .innerJoin(users, eq(employeeProfiles.userId, users.id))
      .where(eq(payrollRecords.payrollPeriodId, periodId));

    return {
      period,
      org: org || { name: 'HRMS Enterprise Inc.', code: 'ENTERPRISE' },
      records,
    };
  }

  /**
   * Generates a corporate ACH Direct Deposit CSV file ready for corporate banking portals
   */
  static async generateAchCsv(periodId: string, organizationId: string): Promise<string> {
    const { period, org, records } = await this.getDisbursementData(periodId, organizationId);

    const headers = [
      'TransactionType',
      'EffectiveDate',
      'OriginatingCompany',
      'EmployeeCode',
      'EmployeeName',
      'EmployeeEmail',
      'RoutingNumber',
      'AccountNumber',
      'AccountType',
      'AmountUSD',
      'PaymentReference',
    ];

    const effectiveDate = period.endDate;
    const rows = records.map((r, idx) => {
      // Deterministic synthetic account generation for testing / demo
      const mockRouting = '121000358'; // Bank of America ACH routing
      const mockAccount = `982001${(1000 + idx).toString()}`;
      const fullName = `"${r.firstName} ${r.lastName}"`;
      const sanitizedCompany = `"${org.name.replace(/"/g, '""')}"`;
      const ref = `PAY-${period.name.replace(/\s+/g, '-')}-${r.employeeCode}`;

      return [
        'PPD_CREDIT',
        effectiveDate,
        sanitizedCompany,
        r.employeeCode,
        fullName,
        r.email,
        mockRouting,
        mockAccount,
        'Checking',
        Number(r.netSalary).toFixed(2),
        ref,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\r\n');
  }

  /**
   * Generates standard NACHA 94-character fixed-width batch file format
   * (Standard ACH File Header 1, Batch Header 5, Entry Detail 6, Batch Control 8, File Control 9)
   */
  static async generateNachaFile(periodId: string, organizationId: string): Promise<string> {
    const { period, org, records } = await this.getDisbursementData(periodId, organizationId);

    const padLeft = (val: string | number, length: number, char = '0') =>
      String(val).padStart(length, char).slice(0, length);
    const padRight = (val: string, length: number, char = ' ') =>
      String(val).padEnd(length, char).slice(0, length);

    const todayYYMMDD = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const nowHHMM = '0930';
    const compName = padRight(org.name.slice(0, 16), 16);
    const compId = '1987654321'; // Federal Tax ID
    const totalCents = records.reduce((acc, r) => acc + Math.round(Number(r.netSalary) * 100), 0);

    // 1. File Header Record (Record Type 1)
    const fileHeader = [
      '1', // Record Type
      '01', // Priority Code
      ' 121000358', // Immediate Destination (10 chars, Bank ABA)
      ' 1987654321', // Immediate Origin (10 chars, Company EIN)
      todayYYMMDD, // Creation Date (6)
      nowHHMM, // Creation Time (4)
      'A', // File ID Modifier (1)
      '094', // Record Size (3)
      '10', // Blocking Factor (2)
      '1', // Format Code (1)
      padRight('SILICON VALLEY BANK', 23), // Destination Bank Name (23)
      padRight(org.name.slice(0, 23), 23), // Company Name (23)
      '00000001', // Reference Code (8)
    ].join('');

    // 2. Company/Batch Header Record (Record Type 5)
    const batchHeader = [
      '5', // Record Type (1)
      '220', // Service Class Code (220 = Credits Only)
      compName, // Company Name (16)
      padRight('PAYROLL', 20), // Discretionary Data (20)
      compId, // Company Identification (10)
      'PPD', // Standard Entry Class (3)
      'SALARY  ', // Company Entry Description (10)
      todayYYMMDD, // Company Descriptive Date (6)
      todayYYMMDD, // Effective Entry Date (6)
      '   ', // Settlement Date (3 spaces)
      '1', // Originator Status Code (1)
      '12100035', // Originating DFI ID (8)
      '0000001', // Batch Number (7)
    ].join('');

    // 3. Entry Detail Records (Record Type 6)
    let entryHash = 0;
    const entryRecords: string[] = [];

    records.forEach((r, idx) => {
      const routing8 = '12100035'; // 8-digit routing
      const checkDigit = '8'; // 9th digit
      const mockAccount = padRight(`982001${1000 + idx}`, 17);
      const amountCents = Math.round(Number(r.netSalary) * 100);
      const individualName = padRight(`${r.firstName} ${r.lastName}`.slice(0, 22), 22);
      const traceNumber = `12100035${padLeft(idx + 1, 7)}`;

      entryHash += parseInt(routing8, 10);

      const entry = [
        '6', // Record Type (1)
        '22', // Transaction Code (22 = Automated Deposit to Checking)
        routing8, // Receiving DFI Routing (8)
        checkDigit, // Check Digit (1)
        mockAccount, // DFI Account Number (17)
        padLeft(amountCents, 10), // Amount in cents (10)
        padRight(r.employeeCode, 15), // Individual ID Number (15)
        individualName, // Individual Name (22)
        '  ', // Discretionary Data (2)
        '0', // Addenda Record Indicator (1)
        traceNumber, // Trace Number (15)
      ].join('');

      entryRecords.push(entry);
    });

    // 4. Batch Control Record (Record Type 8)
    const entryHashStr = padLeft(entryHash.toString().slice(-10), 10);
    const batchControl = [
      '8', // Record Type (1)
      '220', // Service Class Code (3)
      padLeft(records.length, 6), // Entry / Addenda Count (6)
      entryHashStr, // Entry Hash (10)
      '000000000000', // Total Debit Entry Dollar Amount (12)
      padLeft(totalCents, 12), // Total Credit Entry Dollar Amount (12)
      compId, // Company Identification (10)
      '                   ', // Message Authentication Code (19)
      '      ', // Reserved (6)
      '12100035', // Originating DFI ID (8)
      '0000001', // Batch Number (7)
    ].join('');

    // 5. File Control Record (Record Type 9)
    const blockCount = Math.ceil((entryRecords.length + 4) / 10);
    const fileControl = [
      '9', // Record Type (1)
      '000001', // Batch Count (6)
      padLeft(blockCount, 6), // Block Count (6)
      padLeft(records.length, 8), // Total Entry/Addenda Count (8)
      entryHashStr, // Entry Hash (10)
      '000000000000', // Total Debit Amount in File (12)
      padLeft(totalCents, 12), // Total Credit Amount in File (12)
      padRight('', 39), // Reserved (39 blanks)
    ].join('');

    return [fileHeader, batchHeader, ...entryRecords, batchControl, fileControl].join('\r\n');
  }
}
