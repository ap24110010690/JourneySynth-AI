// backend/src/controllers/datasetController.ts
import { Request, Response } from 'express';
import { DatasetModel } from '../models/datasetModel.js';
import { MarkovJourneyEngine } from '../services/markovEngine.js';
import { ProductService } from '../services/productService.js';
import { AnalyticsService } from '../services/analyticsService.js';
import { validateGenerationConfig } from '../utils/validators.js';
import { GenerationConfig } from '../types/index.js';

export class DatasetController {
  public static async generate(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User must be authenticated to generate datasets.' });
      }

      const body = req.body as Partial<GenerationConfig>;
      const validation = validateGenerationConfig(body);
      if (!validation.isValid) {
        return res.status(400).json({ error: validation.error });
      }

      const fullConfig: GenerationConfig = {
        datasetName: body.datasetName!.trim(),
        totalCustomers: Number(body.totalCustomers) || 50,
        channels: body.channels || ['Website', 'Mobile App', 'Email', 'Paid Ads'],
        categories: body.categories || ['Electronics', 'Fashion', 'Beauty', 'Groceries'],
        segments: body.segments || [
          'New Customers',
          'Returning Customers',
          'High-Intent Customers',
          'Browsing Customers',
          'Discount-Seeking Customers',
          'Cart-Abandoning Customers',
        ],
        durationDays: Number(body.durationDays) || 7,
        cartAbandonmentProb: Number(body.cartAbandonmentProb) ?? 0.35,
        purchaseProb: Number(body.purchaseProb) ?? 0.25,
        emailEngagementProb: Number(body.emailEngagementProb) ?? 0.2,
        adClickProb: Number(body.adClickProb) ?? 0.15,
        productRevisitProb: Number(body.productRevisitProb) ?? 0.3,
        returningCustomerProb: Number(body.returningCustomerProb) ?? 0.25,
        minTimeGapMinutes: Number(body.minTimeGapMinutes) || 2,
        maxTimeGapMinutes: Number(body.maxTimeGapMinutes) || 60,
        seed: body.seed ? Number(body.seed) : undefined,
      };

      const catalog = ProductService.getAll();
      const engine = new MarkovJourneyEngine(fullConfig, catalog);

      console.log(`[GENERATOR] Running Markov engine for ${fullConfig.totalCustomers} customers...`);
      const simulationResult = engine.generate();

      console.log(`[GENERATOR] Persisting dataset to database transactionally...`);
      const savedDataset = DatasetModel.saveGeneratedDataset(userId, fullConfig, simulationResult);

      return res.status(201).json({
        message: 'Synthetic customer journeys generated successfully.',
        dataset: savedDataset,
        stats: simulationResult.stats,
      });
    } catch (err: any) {
      console.error('[Generation Error]', err);
      return res.status(500).json({ error: 'Failed to generate synthetic dataset: ' + err.message });
    }
  }

  public static async getAll(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const datasets = DatasetModel.findByUserId(userId);
      return res.json({ datasets });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch datasets' });
    }
  }

  public static async getById(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const dataset = DatasetModel.findById(id, userId);
      if (!dataset) {
        return res.status(404).json({ error: 'Dataset not found or unauthorized' });
      }

      return res.json({ dataset });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch dataset' });
    }
  }

  public static async delete(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const deleted = DatasetModel.delete(id, userId);
      if (!deleted) {
        return res.status(404).json({ error: 'Dataset not found or unauthorized' });
      }

      return res.json({ message: 'Dataset deleted successfully.' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to delete dataset' });
    }
  }

  public static async getDashboardStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const stats = AnalyticsService.getUserDashboardStats(userId);
      return res.json(stats);
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
  }
}
