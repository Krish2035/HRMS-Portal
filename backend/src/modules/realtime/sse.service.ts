import { Response } from 'express';
import { logger } from '../../config/logger';

interface ClientConnection {
  userId: string;
  organizationId: string;
  response: Response;
}

export type RealtimeEventType =
  | 'PRESENCE_UPDATE'
  | 'LEAVE_STATUS_CHANGED'
  | 'TIMESHEET_UPDATED'
  | 'SECURITY_ALERT'
  | 'METRIC_ROLLUP';

export class SseService {
  private static clients: Map<string, ClientConnection> = new Map();

  /**
   * Register an authenticated SSE client connection
   */
  static addClient(clientId: string, userId: string, organizationId: string, response: Response): void {
    this.clients.set(clientId, { userId, organizationId, response });
    logger.info({ clientId, userId, organizationId }, 'SSE Realtime Client connected');

    // Send connection established handshake
    this.sendEventToClient(response, 'CONNECTED', {
      connected: true,
      timestamp: new Date().toISOString(),
      clientId,
    });
  }

  /**
   * Remove a client connection upon disconnect
   */
  static removeClient(clientId: string): void {
    if (this.clients.has(clientId)) {
      this.clients.delete(clientId);
      logger.info({ clientId }, 'SSE Realtime Client disconnected');
    }
  }

  /**
   * Broadcast an event to all users in the specific organization (Tenant-Isolated)
   */
  static broadcastToOrganization(organizationId: string, eventType: RealtimeEventType, data: Record<string, unknown>): void {
    let sentCount = 0;
    this.clients.forEach((client) => {
      if (client.organizationId === organizationId) {
        this.sendEventToClient(client.response, eventType, data);
        sentCount++;
      }
    });
    logger.debug({ organizationId, eventType, sentCount }, 'Realtime broadcast delivered to tenant');
  }

  /**
   * Send an event to a specific targeted user
   */
  static sendToUser(userId: string, eventType: RealtimeEventType, data: Record<string, unknown>): void {
    this.clients.forEach((client) => {
      if (client.userId === userId) {
        this.sendEventToClient(client.response, eventType, data);
      }
    });
  }

  /**
   * Send low-level SSE formatted payload
   */
  private static sendEventToClient(res: Response, event: string, data: Record<string, unknown>): void {
    try {
      res.write(`event: ${event}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (err) {
      logger.warn({ err }, 'Failed to deliver SSE event to connection');
    }
  }

  /**
   * Return number of active streaming connections
   */
  static getActiveClientsCount(): number {
    return this.clients.size;
  }
}
