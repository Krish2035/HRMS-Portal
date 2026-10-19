import nodemailer, { type Transporter } from 'nodemailer';
import { logger } from '../../config/logger';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private static transporter: Transporter | null = null;

  /**
   * Initialize or retrieve SMTP Transporter
   */
  private static getTransporter(): Transporter {
    if (!this.transporter) {
      const host = process.env.SMTP_HOST || 'smtp.ethereal.email';
      const port = Number(process.env.SMTP_PORT) || 587;
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;

      if (user && pass) {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure: port === 465,
          auth: { user, pass },
        });
        logger.info({ host, port }, 'Configured production SMTP mail transport');
      } else {
        // Development / local mock transporter
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: 'mock.hrms@ethereal.email',
            pass: 'mock_password_dev',
          },
        });
        logger.info('Using development mock email transport');
      }
    }
    return this.transporter;
  }

  /**
   * Generic Send Email Method
   */
  static async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string }> {
    try {
      const from = process.env.SMTP_FROM || '"HRMS Enterprise Portal" <noreply@hrms-enterprise.io>';
      const transporter = this.getTransporter();

      // In development without real credentials, log email to console
      if (!process.env.SMTP_USER) {
        logger.info(
          { to: options.to, subject: options.subject },
          '📧 [SMTP-OUTBOX-PREVIEW] Mock Email Dispatched'
        );
        return { success: true, messageId: `mock-${Date.now()}` };
      }

      const info = await transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.subject,
      });

      logger.info({ to: options.to, messageId: info.messageId }, 'Dispatched production email via SMTP');
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error({ error, to: options.to }, 'Failed to deliver email through SMTP');
      return { success: false };
    }
  }

  /**
   * Template 1: Employee Onboarding Welcome Email
   */
  static async sendWelcomeEmail(to: string, name: string, employeeCode: string, tempPass: string): Promise<void> {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; padding: 24px; background: #020617; color: #f8fafc; border-radius: 16px; border: 1px solid #1e293b;">
        <div style="margin-bottom: 20px; border-bottom: 1px solid #1e293b; padding-bottom: 16px;">
          <h2 style="color: #6366f1; margin: 0; font-size: 20px;">HRMS Enterprise Portal</h2>
          <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0;">Workplace Credentials & Onboarding</p>
        </div>
        <p style="font-size: 15px;">Hello <strong>${name}</strong>,</p>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
          Your enterprise profile has been registered in the system. You can now access your employee dashboard, live work timer, and self-service portal.
        </p>
        <div style="background: #0f172a; padding: 16px; border-radius: 12px; border: 1px solid #334155; margin: 20px 0;">
          <p style="margin: 0 0 8px; font-size: 13px; color: #94a3b8;">Employee Code: <strong style="color: #ffffff;">${employeeCode}</strong></p>
          <p style="margin: 0; font-size: 13px; color: #94a3b8;">Temporary Password: <code style="background: #1e293b; color: #38bdf8; padding: 2px 6px; border-radius: 4px;">${tempPass}</code></p>
        </div>
        <a href="http://localhost:3000" style="display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; font-weight: 600; padding: 12px 24px; border-radius: 10px; font-size: 14px;">Sign In to Workplace Portal</a>
        <p style="color: #64748b; font-size: 11px; margin-top: 30px; border-top: 1px solid #1e293b; pt: 12px;">This is an automated notification from HRMS Enterprise. Please change your password upon first login.</p>
      </div>
    `;

    await this.sendEmail({
      to,
      subject: `Welcome to HRMS Enterprise - Employee Code: ${employeeCode}`,
      html,
    });
  }

  /**
   * Template 2: Leave Application Review Status Email
   */
  static async sendLeaveStatusEmail(to: string, employeeName: string, leaveType: string, status: 'approved' | 'rejected', comment?: string): Promise<void> {
    const isApproved = status === 'approved';
    const statusColor = isApproved ? '#10b981' : '#f43f5e';

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; padding: 24px; background: #020617; color: #f8fafc; border-radius: 16px; border: 1px solid #1e293b;">
        <h2 style="color: #6366f1; margin: 0 0 16px; font-size: 18px;">Leave Request Update</h2>
        <p style="font-size: 14px;">Hi <strong>${employeeName}</strong>,</p>
        <p style="color: #cbd5e1; font-size: 14px;">Your request for <strong>${leaveType}</strong> has been reviewed:</p>
        <div style="background: #0f172a; padding: 16px; border-radius: 12px; border-left: 4px solid ${statusColor}; margin: 16px 0;">
          <p style="margin: 0; font-size: 14px; font-weight: 600; color: ${statusColor};">STATUS: ${status.toUpperCase()}</p>
          ${comment ? `<p style="margin: 8px 0 0; font-size: 13px; color: #94a3b8;">Approver Notes: "${comment}"</p>` : ''}
        </div>
        <p style="color: #64748b; font-size: 12px;">Your updated quota balance is now reflected in your self-service portal.</p>
      </div>
    `;

    await this.sendEmail({
      to,
      subject: `Leave Request ${status.toUpperCase()}: ${leaveType}`,
      html,
    });
  }

  /**
   * Template 3: Critical IDOR / ROLA Security Breach Interception Alert
   */
  static async sendSecurityAlertEmail(to: string, alertDetails: { action: string; targetResource: string; ip: string; actor: string }): Promise<void> {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; padding: 24px; background: #020617; color: #f8fafc; border-radius: 16px; border: 1px solid #991b1b;">
        <div style="background: #450a0a; border: 1px solid #dc2626; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #fca5a5; margin: 0; font-size: 16px;">⚠️ SECURITY ALERT: Access Control Violation Blocked</h3>
        </div>
        <p style="font-size: 14px; color: #f8fafc;">A suspicious direct object access attempt was intercepted by your security shield:</p>
        <div style="background: #0f172a; padding: 16px; border-radius: 12px; border: 1px solid #334155; margin: 16px 0; font-family: monospace; font-size: 13px;">
          <p style="margin: 0 0 6px; color: #e2e8f0;">Violation: <span style="color: #f87171;">${alertDetails.action}</span></p>
          <p style="margin: 0 0 6px; color: #e2e8f0;">Resource: ${alertDetails.targetResource}</p>
          <p style="margin: 0 0 6px; color: #e2e8f0;">Originating IP: ${alertDetails.ip}</p>
          <p style="margin: 0; color: #e2e8f0;">Actor ID: ${alertDetails.actor}</p>
        </div>
        <p style="color: #94a3b8; font-size: 12px;">The request was rejected with HTTP 403 Forbidden and an immutable entry was written to your audit logs.</p>
      </div>
    `;

    await this.sendEmail({
      to,
      subject: `🚨 [SECURITY ALERT] ${alertDetails.action} Intercepted`,
      html,
    });
  }
}
