// backend/src/routes/exportRoutes.ts
import { Router, Request, Response } from 'express';
import { ExportService } from '../services/exportService.js';
import { DatasetModel } from '../models/datasetModel.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/:datasetId/csv', (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { datasetId } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const dataset = DatasetModel.findById(datasetId, userId);
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found or unauthorized' });
    }

    const csvContent = ExportService.exportDatasetToCsv(datasetId);
    const filename = `${dataset.dataset_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_events.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(csvContent);
  } catch (err: any) {
    console.error('[Export CSV Error]', err);
    return res.status(500).json({ error: 'Failed to export CSV' });
  }
});

router.get('/:datasetId/json', (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { datasetId } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const dataset = DatasetModel.findById(datasetId, userId);
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found or unauthorized' });
    }

    const jsonData = ExportService.exportDatasetToJson(datasetId, userId);
    const filename = `${dataset.dataset_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_journeys.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.json(jsonData);
  } catch (err: any) {
    console.error('[Export JSON Error]', err);
    return res.status(500).json({ error: 'Failed to export JSON' });
  }
});

export default router;
