import { Router, Request, Response } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { SseService } from './sse.service';

const router = Router();

/**
 * GET /api/v1/realtime/events
 * Establishes an HTTP/2 or HTTP/1.1 Server-Sent Events (SSE) push stream
 */
router.get('/events', authenticate, (req: Request, res: Response) => {
  const user = req.user!;
  const clientId = `${user.userId}-${Date.now()}`;

  // Mandatory SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Critical: disables response buffering in NGINX
  });

  // Keep-alive heartbeat every 20 seconds to prevent proxy timeouts
  const heartbeat = setInterval(() => {
    res.write(': keep-alive\n\n');
  }, 20000);

  // Register client in SseService
  SseService.addClient(clientId, user.userId, user.organizationId, res);

  // Cleanup on connection termination
  req.on('close', () => {
    clearInterval(heartbeat);
    SseService.removeClient(clientId);
  });
});

/**
 * GET /api/v1/realtime/status
 * Returns telemetry regarding active realtime streaming subscribers
 */
router.get('/status', authenticate, (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      activeSubscribers: SseService.getActiveClientsCount(),
      protocol: 'Server-Sent Events (SSE)',
      heartbeatIntervalMs: 20000,
    },
  });
});

export default router;
