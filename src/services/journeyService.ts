// src/services/journeyService.ts
import { api } from './api';
import { Customer, CustomerTimelineData, JourneyEvent } from '../types/frontend';

export interface JourneyQueryParams {
  datasetId: string;
  customerId?: string;
  customerCode?: string;
  channel?: string;
  productCategory?: string;
  eventType?: string;
  customerSegment?: string;
  purchaseStatus?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const journeyService = {
  async getEvents(params: JourneyQueryParams): Promise<{
    events: JourneyEvent[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const res = await api.get('/journeys', { params });
    return res.data;
  },

  async getCustomersByDataset(datasetId: string): Promise<Customer[]> {
    const res = await api.get<{ customers: Customer[] }>(`/journeys/customers/${datasetId}`);
    return res.data.customers;
  },

  async getCustomerTimeline(customerId: string): Promise<CustomerTimelineData> {
    const res = await api.get<CustomerTimelineData>(`/journeys/${customerId}/timeline`);
    return res.data;
  },
};
