// backend/src/controllers/analyticsController.ts
import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analyticsService.js';
import { DatasetModel } from '../models/datasetModel.js';

export class AnalyticsController {
  public static async getAnalytics(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { datasetId } = req.params;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      // Verify dataset ownership
      const dataset = DatasetModel.findById(datasetId, userId);
      if (!dataset) {
        return res.status(404).json({ error: 'Dataset not found or unauthorized' });
      }

      const analytics = AnalyticsService.getDatasetAnalytics(datasetId);
      if (!analytics) {
        return res.status(404).json({ error: 'Failed to compute analytics for dataset' });
      }

      return res.json({ analytics });
    } catch (err: any) {
      console.error('[Analytics Error]', err);
      return res.status(500).json({ error: 'Failed to retrieve analytics' });
    }
  }
}
