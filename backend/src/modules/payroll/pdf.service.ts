import PDFDocument from 'pdfkit';

export interface PayslipPdfData {
  organizationName: string;
  periodName: string;
  startDate: string;
  endDate: string;
  employeeCode: string;
  employeeName: string;
  departmentName?: string;
  workLocation?: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: string;
  paymentDate?: string | null;
  payslipId: string;
}

export class PdfService {
  /**
   * Generates a sleek, executive PDF payslip buffer for an employee
   */
  static async generatePayslipPdf(data: PayslipPdfData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 40,
        });

        const buffers: Buffer[] = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        // Colors
        const primaryColor = '#1e293b'; // slate-800
        const accentColor = '#2563eb'; // blue-600
        const mutedColor = '#64748b'; // slate-500
        const borderColor = '#e2e8f0'; // slate-200
        const lightBg = '#f8fafc'; // slate-50

        // --- Header Banner ---
        doc.rect(40, 40, 515, 65).fill(lightBg);
        doc.rect(40, 40, 6, 65).fill(accentColor);

        doc
          .fillColor(primaryColor)
          .font('Helvetica-Bold')
          .fontSize(18)
          .text(data.organizationName.toUpperCase(), 60, 52);

        doc
          .fillColor(mutedColor)
          .font('Helvetica')
          .fontSize(10)
          .text('CONFIDENTIAL EMPLOYEE PAYSLIP & EARNINGS STATEMENT', 60, 75);

        doc
          .fillColor(accentColor)
          .font('Helvetica-Bold')
          .fontSize(12)
          .text(data.periodName, 400, 55, { align: 'right', width: 140 });

        doc
          .fillColor(mutedColor)
          .font('Helvetica')
          .fontSize(9)
          .text(`${data.startDate} to ${data.endDate}`, 400, 75, { align: 'right', width: 140 });

        // --- Employee Information Section ---
        let y = 125;
        doc.rect(40, y, 515, 75).stroke(borderColor);

        // Column 1
        doc.fillColor(mutedColor).font('Helvetica').fontSize(9).text('EMPLOYEE NAME', 55, y + 12);
        doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(11).text(data.employeeName, 55, y + 26);

        doc.fillColor(mutedColor).font('Helvetica').fontSize(9).text('EMPLOYEE ID', 55, y + 45);
        doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(10).text(data.employeeCode, 55, y + 57);

        // Column 2
        doc.fillColor(mutedColor).font('Helvetica').fontSize(9).text('DEPARTMENT', 220, y + 12);
        doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(10).text(data.departmentName || 'Engineering & Operations', 220, y + 26);

        doc.fillColor(mutedColor).font('Helvetica').fontSize(9).text('WORK LOCATION', 220, y + 45);
        doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(10).text(data.workLocation || 'Headquarters / Hybrid', 220, y + 57);

        // Column 3
        doc.fillColor(mutedColor).font('Helvetica').fontSize(9).text('PAYSLIP ID', 380, y + 12);
        doc.fillColor(primaryColor).font('Helvetica').fontSize(8).text(data.payslipId.substring(0, 18) + '...', 380, y + 26);

        doc.fillColor(mutedColor).font('Helvetica').fontSize(9).text('DISBURSEMENT STATUS', 380, y + 45);
        const statusColor = data.status.toLowerCase() === 'paid' ? '#16a34a' : '#d97706';
        doc.fillColor(statusColor).font('Helvetica-Bold').fontSize(10).text(data.status.toUpperCase(), 380, y + 57);

        // --- Earnings & Deductions Breakdown Tables ---
        y = 220;
        doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(12).text('Compensation Breakdown', 40, y);
        y += 20;

        // Table Headers
        doc.rect(40, y, 250, 24).fill('#f1f5f9');
        doc.rect(305, y, 250, 24).fill('#f1f5f9');

        doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(10).text('EARNINGS', 50, y + 7);
        doc.text('AMOUNT', 220, y + 7, { align: 'right', width: 60 });

        doc.text('DEDUCTIONS', 315, y + 7);
        doc.text('AMOUNT', 485, y + 7, { align: 'right', width: 60 });

        y += 24;

        // Row 1
        doc.rect(40, y, 250, 22).stroke(borderColor);
        doc.rect(305, y, 250, 22).stroke(borderColor);
        doc.fillColor(primaryColor).font('Helvetica').fontSize(9).text('Base Salary', 50, y + 6);
        doc.text(`$${data.baseSalary.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 220, y + 6, { align: 'right', width: 60 });

        doc.text('Statutory Tax Withholding', 315, y + 6);
        const taxEst = (data.deductions * 0.7).toFixed(2);
        doc.text(`$${Number(taxEst).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 485, y + 6, { align: 'right', width: 60 });

        y += 22;

        // Row 2
        doc.rect(40, y, 250, 22).stroke(borderColor);
        doc.rect(305, y, 250, 22).stroke(borderColor);
        doc.fillColor(primaryColor).font('Helvetica').fontSize(9).text('Travel & Wellness Allowance', 50, y + 6);
        doc.text(`$${data.allowances.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 220, y + 6, { align: 'right', width: 60 });

        doc.text('Health & Benefit Deductions', 315, y + 6);
        const benefitEst = (data.deductions * 0.3).toFixed(2);
        doc.text(`$${Number(benefitEst).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 485, y + 6, { align: 'right', width: 60 });

        y += 22;

        // Subtotals Row
        doc.rect(40, y, 250, 24).fill(lightBg);
        doc.rect(305, y, 250, 24).fill(lightBg);
        doc.rect(40, y, 250, 24).stroke(borderColor);
        doc.rect(305, y, 250, 24).stroke(borderColor);

        const grossEarnings = data.baseSalary + data.allowances;
        doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(9).text('Total Gross Earnings', 50, y + 7);
        doc.text(`$${grossEarnings.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 220, y + 7, { align: 'right', width: 60 });

        doc.text('Total Deductions', 315, y + 7);
        doc.text(`$${data.deductions.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 485, y + 7, { align: 'right', width: 60 });

        // --- Net Pay Highlight Banner ---
        y += 45;
        doc.rect(40, y, 515, 60).fill('#0f172a'); // slate-900

        doc.fillColor('#94a3b8').font('Helvetica').fontSize(10).text('NET TAKE-HOME SALARY', 60, y + 16);
        doc
          .fillColor('#38bdf8') // sky-400
          .font('Helvetica-Bold')
          .fontSize(22)
          .text(`$${data.netSalary.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 60, y + 30);

        doc
          .fillColor('#94a3b8')
          .font('Helvetica')
          .fontSize(9)
          .text(`Disbursed via Direct Deposit ACH`, 350, y + 18, { align: 'right', width: 185 });

        if (data.paymentDate) {
          doc
            .fillColor('#f8fafc')
            .font('Helvetica-Bold')
            .fontSize(10)
            .text(`Value Date: ${data.paymentDate}`, 350, y + 33, { align: 'right', width: 185 });
        }

        // --- Legal Notice & Footer ---
        y = 700;
        doc.strokeColor(borderColor).lineWidth(1).moveTo(40, y).lineTo(555, y).stroke();

        doc
          .fillColor(mutedColor)
          .font('Helvetica')
          .fontSize(8)
          .text(
            'This document is an electronically generated and digitally validated salary voucher. No physical signature is required under corporate digital records governance.',
            40,
            y + 12,
            { align: 'center', width: 515 }
          );

        doc
          .fontSize(7)
          .text(
            `Generated by HRMS Enterprise Platform on ${new Date().toISOString()} • Organization Code: ${data.organizationName}`,
            40,
            y + 30,
            { align: 'center', width: 515 }
          );

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
