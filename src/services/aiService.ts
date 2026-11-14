// src/services/aiService.ts
import { api } from './api';

export interface AiAnalysisResult {
  source: 'gemini' | 'rule_based_fallback';
  report: string;
  metricsSummary: any;
}

export interface AiPersonaResult {
  source: 'gemini' | 'rule_based_fallback';
  persona: {
    name: string;
    code: string;
    archetype: string;
    demographics: string;
    shoppingStyle: string;
    browsingBehavior: string;
    productInterests: string[];
    motivationOrFriction: string;
    recommendations: string[];
    disclaimer: string;
  };
}

export interface AiQuestionResult {
  source: 'gemini' | 'rule_based_fallback';
  answer: string;
}

export const aiService = {
  async analyzeDataset(datasetId: string): Promise<AiAnalysisResult> {
    const res = await api.post<AiAnalysisResult>(`/ai/analyze/${datasetId}`);
    return res.data;
  },

  async generatePersona(customerId: string): Promise<AiPersonaResult> {
    const res = await api.post<AiPersonaResult>(`/ai/persona/${customerId}`);
    return res.data;
  },

  async askQuestion(datasetId: string, question: string): Promise<AiQuestionResult> {
    const res = await api.post<AiQuestionResult>(`/ai/question/${datasetId}`, { question });
    return res.data;
  },
};
