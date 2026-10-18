import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../app';

describe('HRMS Express API - Health & Middleware Integration Tests', () => {
  const app = createApp();

  it('GET /health/liveness should return 200 and process uptime', async () => {
    const res = await request(app).get('/health/liveness');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.uptime).toBeDefined();
    expect(res.headers['x-request-id']).toBeDefined();
  });

  it('GET /api/v1/health should return service metadata', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.service).toBe('hrms-backend');
    expect(res.body.data.version).toBe('1.0.0');
  });

  it('GET /non-existent-route should return structured 404 error with requestId', async () => {
    const res = await request(app).get('/non-existent-route');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.requestId).toBeDefined();
  });

  it('POST /api/v1/auth/login without body should return 400 validation error', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toBeInstanceOf(Array);
  });

  it('GET /api/v1/work-sessions/current without auth header should return 401 unauthorized', async () => {
    const res = await request(app).get('/api/v1/work-sessions/current');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
