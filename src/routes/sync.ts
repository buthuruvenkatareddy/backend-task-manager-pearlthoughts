import { Router, Request, Response } from 'express';
import { SyncService } from '../services/syncService';
import { TaskService } from '../services/taskService';
import { Database } from '../db/database';

export function createSyncRouter(db: Database): Router {
  const router = Router();
  const taskService = new TaskService(db);
  const syncService = new SyncService(db, taskService);

  // Trigger manual sync
  router.post('/sync', async (req: Request, res: Response) => {
    try {
      // Check connectivity first
      const isOnline = await syncService.checkConnectivity();
      
      if (!isOnline) {
        return res.status(503).json({ 
          error: 'Server is not reachable',
          success: false,
          synced_items: 0,
          failed_items: 0
        });
      }

      // Call syncService.sync()
      const result = await syncService.sync();
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        error: 'Sync failed',
        success: false,
        synced_items: 0,
        failed_items: 0
      });
    }
  });

  // Check sync status
  router.get('/status', async (req: Request, res: Response) => {
    try {
      const status = await syncService.getSyncStatus();
      
      res.json({
        pending_sync_count: status.pending_count,
        last_sync_at: status.last_sync_at,
        is_online: status.is_online,
        status: status.pending_count > 0 ? 'pending' : 'synced'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get sync status' });
    }
  });

  // Batch sync endpoint (for server-side)
  router.post('/batch', async (req: Request, res: Response) => {
    try {
      // This is a mock implementation for the server side
      // In a real scenario, this would be on a separate server
      const batchRequest = req.body;
      
      if (!batchRequest.items || !Array.isArray(batchRequest.items)) {
        return res.status(400).json({ error: 'Invalid batch request' });
      }

      // Process each item and return success responses
      const processedItems = batchRequest.items.map((item: any) => ({
        client_id: item.task_id,
        server_id: item.task_id, // In real scenario, server would generate new IDs
        status: 'success',
        resolved_data: item.data
      }));

      res.json({
        processed_items: processedItems
      });
    } catch (error) {
      res.status(500).json({ error: 'Batch sync failed' });
    }
  });

  // Health check endpoint
  router.get('/health', async (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date() });
  });

  return router;
}