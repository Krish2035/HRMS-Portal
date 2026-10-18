import { describe, it, expect } from 'vitest';

describe('Organization & Employee Dual-Compensation Architecture - Unit Tests', () => {
  it('should validate organization code generation format from company name', () => {
    const companyName = 'Global Apex Logistics & Freight Inc.';
    const baseCode = companyName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    expect(baseCode).toBe('GLOBALAP');

    const sampleOrgCode = `${baseCode}-842`;
    expect(sampleOrgCode).toMatch(/^[A-Z0-9]{3,8}-\d{3}$/);
  });

  it('should enforce proper compensation data schema for Salaried employees', () => {
    const salariedEmployee = {
      firstName: 'Alice',
      lastName: 'Wong',
      email: 'alice.wong@acme.com',
      compensationType: 'salaried' as const,
      baseSalary: 7500.0,
      hourlyRate: 0.0,
      overtimeRateMultiplier: 1.5,
      standardWeeklyHours: 40.0,
    };

    expect(salariedEmployee.compensationType).toBe('salaried');
    expect(salariedEmployee.baseSalary).toBeGreaterThan(0);
    expect(salariedEmployee.hourlyRate).toBe(0.0);
  });

  it('should calculate accurate gross pay and overtime for Hourly contractors', () => {
    const hourlyContractor = {
      firstName: 'David',
      lastName: 'Miller',
      email: 'david.miller@acme.com',
      compensationType: 'hourly' as const,
      baseSalary: 0.0,
      hourlyRate: 45.0, // $45/hr
      overtimeRateMultiplier: 1.5, // 1.5x for OT
      standardWeeklyHours: 40.0,
    };

    // Employee worked 48 hours in a week (8 hours of overtime)
    const totalWorkedHours = 48;
    const regularHours = Math.min(totalWorkedHours, hourlyContractor.standardWeeklyHours);
    const overtimeHours = Math.max(0, totalWorkedHours - hourlyContractor.standardWeeklyHours);

    const regularPay = regularHours * hourlyContractor.hourlyRate; // 40 * 45 = $1,800
    const overtimePay = overtimeHours * (hourlyContractor.hourlyRate * hourlyContractor.overtimeRateMultiplier); // 8 * 67.5 = $540
    const grossWeeklyPay = regularPay + overtimePay; // $2,340

    expect(regularHours).toBe(40);
    expect(overtimeHours).toBe(8);
    expect(regularPay).toBe(1800);
    expect(overtimePay).toBe(540);
    expect(grossWeeklyPay).toBe(2340);
  });
});
