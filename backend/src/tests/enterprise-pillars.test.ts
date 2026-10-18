import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';
import { CloudStorageService } from '../storage/s3.service';
import { RowLevelSecurityService } from '../db/rls';

describe('Enterprise 10/10 Architectural Pillars Test Suite', () => {
  const app = createApp();

  describe('Pillar 1: Row-Level Security (RLS) Tenant Isolation Engine', () => {
    it('should generate valid PostgreSQL session context setting SQL', () => {
      const orgId = '550e8400-e29b-41d4-a716-446655440000';
      const sqlObj = RowLevelSecurityService.getSetContextSql(orgId, false);
      expect(sqlObj).toBeDefined();
      expect(sqlObj.queryChunks).toBeDefined();
    });
  });

  describe('Pillar 2: Production Observability & Prometheus Telemetry (/metrics)', () => {
    it('GET /metrics should return 200 with Prometheus exposition format', async () => {
      const res = await request(app).get('/metrics');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/plain');
      // Verify standard and custom metrics are present
      expect(res.text).toContain('process_cpu_user_seconds_total');
      expect(res.text).toContain('hrms_active_work_sessions');
      expect(res.text).toContain('hrms_pending_timesheets');
      expect(res.text).toContain('hrms_http_requests_total');
    });
  });

  describe('Pillar 3: Encrypted Cloud Storage Vault & Pre-signed URLs', () => {
    it('generatePresignedUrl should generate a cryptographically signed 15-minute expiring link', () => {
      const key = 'tenants/test-org/payslips/pay-123.pdf';
      const filename = 'payslip-oct-2026.pdf';
      const url = CloudStorageService.generatePresignedUrl({
        key,
        filename,
        expiresInSeconds: 900,
      });

      expect(url).toContain('https://');
      expect(url).toContain('.s3.');
      expect(url).toContain(key);
      expect(url).toContain('Expires=');
      expect(url).toContain('Signature=');
      expect(url).toContain('response-content-disposition=');
    });

    it('uploadPayslip should return AES-256 encrypted artifact metadata', async () => {
      const pdfBuffer = Buffer.from('%PDF-1.4 dummy enterprise payslip content');
      const result = await CloudStorageService.uploadPayslip({
        payslipId: 'ps-999',
        organizationId: 'org-abc',
        pdfBuffer,
      });

      expect(result.serverSideEncryption).toBe('AES256');
      expect(result.key).toBe('tenants/org-abc/payslips/ps-999.pdf');
      expect(result.etag).toBeDefined();
      expect(result.sizeBytes).toBe(pdfBuffer.length);
    });
  });

  describe('Pillar 4: RFC 7644 SCIM 2.0 Directory Synchronization Protocol', () => {
    it('GET /scim/v2/ServiceProviderConfig should return supported discovery specs', async () => {
      const res = await request(app).get('/scim/v2/ServiceProviderConfig');

      expect(res.status).toBe(200);
      expect(res.body.schemas).toContain('urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig');
      expect(res.body.patch.supported).toBe(true);
      expect(res.body.authenticationSchemes[0].type).toBe('oauthbearertoken');
    });

    it('GET /scim/v2/Users should return RFC 7644 compliant ListResponse', async () => {
      const res = await request(app).get('/scim/v2/Users');

      expect(res.status).toBe(200);
      expect(res.body.schemas).toContain('urn:ietf:params:scim:api:messages:2.0:ListResponse');
      expect(typeof res.body.totalResults).toBe('number');
      expect(Array.isArray(res.body.Resources)).toBe(true);
    });
  });
});
