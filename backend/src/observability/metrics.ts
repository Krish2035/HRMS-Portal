import client from 'prom-client';
import { Request, Response, NextFunction } from 'express';

// Enable default runtime metrics (heap memory, event loop lag, CPU, GC)
const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: 'hrms_' });

// --- Custom Production Telemetry Metrics ---

export const httpRequestsTotal = new client.Counter({
  name: 'hrms_http_requests_total',
  help: 'Total number of HTTP requests processed by HRMS API',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const httpRequestDurationSeconds = new client.Histogram({
  name: 'hrms_http_request_duration_seconds',
  help: 'HTTP request latency distribution in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

export const activeWorkSessionsGauge = new client.Gauge({
  name: 'hrms_active_work_sessions_total',
  help: 'Number of currently active/running employee work sessions',
  labelNames: ['organization_id'],
  registers: [register],
});

export const pendingTimesheetsGauge = new client.Gauge({
  name: 'hrms_pending_timesheets_approval_total',
  help: 'Number of weekly timesheets submitted and awaiting manager review',
  labelNames: ['organization_id'],
  registers: [register],
});

export const payrollDisbursedCounter = new client.Counter({
  name: 'hrms_payroll_disbursed_total_usd',
  help: 'Cumulative total net salary disbursed via direct deposit ACH/NACHA',
  labelNames: ['organization_id'],
  registers: [register],
});

/**
 * Express middleware to track latency and response codes for every route
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationSeconds = diff[0] + diff[1] / 1e9;
    const route = req.baseUrl || req.path || 'unknown';
    const statusCode = res.statusCode.toString();

    httpRequestsTotal.inc({ method: req.method, route, status_code: statusCode });
    httpRequestDurationSeconds.observe({ method: req.method, route, status_code: statusCode }, durationSeconds);
  });

  next();
}

/**
 * HTTP handler returning standard Prometheus metrics for Datadog / Grafana scraping
 */
export async function getMetricsHandler(_req: Request, res: Response): Promise<void> {
  res.setHeader('Content-Type', register.contentType);
  res.status(200).send(await register.metrics());
}
