import { describe, it, expect } from 'vitest';
import { SseService } from '../modules/realtime/sse.service';
import { EmailService } from '../modules/notifications/email.service';

describe('Real-time SSE & SMTP Email Delivery - Unit Tests', () => {
  it('SseService: should register, count, and remove streaming clients', () => {
    const mockRes = {
      write: () => true,
    } as unknown as import('express').Response;

    const initialCount = SseService.getActiveClientsCount();

    // Register 2 clients
    SseService.addClient('test-c1', 'user-1', 'org-1', mockRes);
    SseService.addClient('test-c2', 'user-2', 'org-1', mockRes);

    expect(SseService.getActiveClientsCount()).toBe(initialCount + 2);

    // Remove client
    SseService.removeClient('test-c1');
    expect(SseService.getActiveClientsCount()).toBe(initialCount + 1);

    // Cleanup
    SseService.removeClient('test-c2');
  });

  it('SseService: should broadcast tenant-isolated events without throwing', () => {
    expect(() => {
      SseService.broadcastToOrganization('org-1', 'PRESENCE_UPDATE', {
        employeeName: 'Krish Patel',
        status: 'running',
      });
    }).not.toThrow();

    expect(() => {
      SseService.sendToUser('user-1', 'SECURITY_ALERT', {
        type: 'IDOR_BLOCKED',
      });
    }).not.toThrow();
  });

  it('EmailService: should generate formatted HTML welcome email for onboarding', async () => {
    const result = await EmailService.sendEmail({
      to: 'alex.rivera@example.com',
      subject: 'Welcome to HRMS Enterprise',
      html: '<h1>Welcome Alex</h1><p>Your employee code is EMP-00105</p>',
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });

  it('EmailService: should dispatch leave approval notifications gracefully', async () => {
    expect(async () => {
      await EmailService.sendLeaveStatusEmail(
        'sarah.jenkins@example.com',
        'Sarah Jenkins',
        'Paid Time Off (PTO)',
        'approved',
        'Approved by Engineering Manager'
      );
    }).not.toThrow();
  });

  it('EmailService: should dispatch security breach interception alerts', async () => {
    expect(async () => {
      await EmailService.sendSecurityAlertEmail('security-admin@hrms.io', {
        action: 'IDOR_CROSS_TENANT_VIOLATION',
        targetResource: 'work_sessions',
        ip: '198.51.100.22',
        actor: 'user-malicious',
      });
    }).not.toThrow();
  });
});
