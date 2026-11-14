// backend/src/controllers/aiController.ts
import { Request, Response } from 'express';
import { GeminiService } from '../services/geminiService.js';
import { DatasetModel } from '../models/datasetModel.js';

export class AiController {
  // Feature A: Structured Behaviour Analysis
  public static async analyzeDataset(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { datasetId } = req.params;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const dataset = DatasetModel.findById(datasetId, userId);
      if (!dataset) {
        return res.status(404).json({ error: 'Dataset not found or unauthorized' });
      }

      const result = await GeminiService.analyzeDataset(datasetId);
      return res.json(result);
    } catch (err: any) {
      console.error('[AI Analysis Error]', err);
      return res.status(500).json({ error: 'AI analysis failed: ' + err.message });
    }
  }

  // Feature B: AI Customer Persona
  public static async generatePersona(req: Request, res: Response) {
    try {
      const { customerId } = req.params;
      const result = await GeminiService.generateCustomerPersona(customerId);
      return res.json(result);
    } catch (err: any) {
      console.error('[AI Persona Error]', err);
      return res.status(500).json({ error: 'AI Persona generation failed: ' + err.message });
    }
  }

  // Feature C: AI Drop-off Q&A
  public static async askQuestion(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { datasetId } = req.params;
      const { question } = req.body;

      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      if (!question || question.trim().length === 0) {
        return res.status(400).json({ error: 'Question text is required' });
      }

      const dataset = DatasetModel.findById(datasetId, userId);
      if (!dataset) {
        return res.status(404).json({ error: 'Dataset not found or unauthorized' });
      }

      const result = await GeminiService.answerQuestion(datasetId, question.trim());
      return res.json(result);
    } catch (err: any) {
      console.error('[AI Q&A Error]', err);
      return res.status(500).json({ error: 'AI Question processing failed: ' + err.message });
    }
  }
}
