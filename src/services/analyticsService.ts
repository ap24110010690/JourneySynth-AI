// src/services/analyticsService.ts
import { api } from './api';
import { DatasetAnalytics } from '../types/frontend';

export const analyticsService = {
  async getDatasetAnalytics(datasetId: string): Promise<DatasetAnalytics> {
    const res = await api.get<{ analytics: DatasetAnalytics }>(`/analytics/${datasetId}`);
    return res.data.analytics;
  },
};
