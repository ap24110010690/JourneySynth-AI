// src/services/datasetService.ts
import { api } from './api';
import { Dataset, DashboardStats, GenerationConfig } from '../types/frontend';

export const datasetService = {
  async generateDataset(config: Partial<GenerationConfig>): Promise<{ dataset: Dataset; stats: any }> {
    const res = await api.post<{ message: string; dataset: Dataset; stats: any }>('/datasets/generate', config);
    return res.data;
  },

  async getDatasets(): Promise<Dataset[]> {
    const res = await api.get<{ datasets: Dataset[] }>('/datasets');
    return res.data.datasets;
  },

  async getDatasetById(id: string): Promise<Dataset> {
    const res = await api.get<{ dataset: Dataset }>(`/datasets/${id}`);
    return res.data.dataset;
  },

  async deleteDataset(id: string): Promise<void> {
    await api.delete(`/datasets/${id}`);
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const res = await api.get<DashboardStats>('/datasets/dashboard/stats');
    return res.data;
  },

  getExportCsvUrl(datasetId: string): string {
    return `/api/export/${datasetId}/csv`;
  },

  getExportJsonUrl(datasetId: string): string {
    return `/api/export/${datasetId}/json`;
  },
};
