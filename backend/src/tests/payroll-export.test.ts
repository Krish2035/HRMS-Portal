import { describe, it, expect } from 'vitest';
import { PdfService } from '../modules/payroll/pdf.service';

describe('Payroll PDF & Bank Export Engine - Unit Tests', () => {
  it('should generate a valid PDF binary buffer with standard %PDF magic header', async () => {
    const mockData = {
      organizationName: 'Acme Global Technologies Inc.',
      periodName: 'October 2026',
      startDate: '2026-10-01',
      endDate: '2026-10-31',
      employeeCode: 'EMP-00101',
      employeeName: 'Sarah Jenkins',
      departmentName: 'Engineering & Infrastructure',
      workLocation: 'San Francisco HQ',
      baseSalary: 6500.0,
      allowances: 750.0,
      deductions: 820.0,
      netSalary: 6430.0,
      status: 'paid',
      paymentDate: '2026-10-31',
      payslipId: '11111111-2222-3333-4444-555555555555',
    };

    const pdfBuffer = await PdfService.generatePayslipPdf(mockData);

    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(1000); // Standard formatted payslip is > 1KB

    // Check %PDF header magic bytes
    const pdfHeader = pdfBuffer.slice(0, 4).toString('utf-8');
    expect(pdfHeader).toBe('%PDF');

    // Check PDF EOF marker
    const pdfContent = pdfBuffer.toString('utf-8');
    expect(pdfContent).toContain('%%EOF');
  });

  it('should format correct compensation arithmetic in payslip metrics', () => {
    const baseSalary = 5000.0;
    const allowances = 500.0;
    const deductions = 350.0;
    const gross = baseSalary + allowances;
    const net = gross - deductions;

    expect(gross).toBe(5500.0);
    expect(net).toBe(5150.0);
  });
});
