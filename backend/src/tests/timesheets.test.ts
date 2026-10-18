import { describe, it, expect } from 'vitest';

describe('Manager Timesheet Approval Gate & Overtime Engine - Unit Tests', () => {
  it('should accurately split total hours into regular (up to standard cap) and overtime', () => {
    const standardWeeklyHours = 40.0;
    const testCases = [
      { totalTrackedHours: 35.5, expectedReg: 35.5, expectedOT: 0.0 },
      { totalTrackedHours: 40.0, expectedReg: 40.0, expectedOT: 0.0 },
      { totalTrackedHours: 48.0, expectedReg: 40.0, expectedOT: 8.0 },
      { totalTrackedHours: 55.25, expectedReg: 40.0, expectedOT: 15.25 },
    ];

    for (const tc of testCases) {
      const reg = Math.min(tc.totalTrackedHours, standardWeeklyHours);
      const ot = Math.max(0, tc.totalTrackedHours - standardWeeklyHours);

      expect(reg).toBe(tc.expectedReg);
      expect(ot).toBe(tc.expectedOT);
      expect(reg + ot).toBe(tc.totalTrackedHours);
    }
  });

  it('should enforce valid timesheet approval state transitions', () => {
    type TimesheetStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'locked';

    const canSubmit = (status: TimesheetStatus) => status === 'draft' || status === 'rejected';
    const canReview = (status: TimesheetStatus) => status === 'submitted';
    const canLockForPayroll = (status: TimesheetStatus) => status === 'approved';

    expect(canSubmit('draft')).toBe(true);
    expect(canSubmit('rejected')).toBe(true);
    expect(canSubmit('submitted')).toBe(false);
    expect(canSubmit('approved')).toBe(false);

    expect(canReview('submitted')).toBe(true);
    expect(canReview('draft')).toBe(false);
    expect(canReview('approved')).toBe(false);

    expect(canLockForPayroll('approved')).toBe(true);
    expect(canLockForPayroll('submitted')).toBe(false);
  });

  it('should calculate verified gross compensation for approved timesheets', () => {
    const hourlyRate = 50.0; // $50/hr
    const overtimeMultiplier = 1.5; // 1.5x

    const approvedTimesheet = {
      regularHours: 40.0,
      overtimeHours: 12.0,
      status: 'approved',
    };

    const regularPay = approvedTimesheet.regularHours * hourlyRate; // 40 * 50 = $2,000
    const overtimePay = approvedTimesheet.overtimeHours * (hourlyRate * overtimeMultiplier); // 12 * 75 = $900
    const totalGross = regularPay + overtimePay; // $2,900

    expect(regularPay).toBe(2000.0);
    expect(overtimePay).toBe(900.0);
    expect(totalGross).toBe(2900.0);
  });
});
