// backend/src/controllers/journeyController.ts
import { Request, Response } from 'express';
import { EventModel } from '../models/eventModel.js';
import { CustomerModel } from '../models/customerModel.js';
import { SessionModel } from '../models/sessionModel.js';
import { DatasetModel } from '../models/datasetModel.js';

export class JourneyController {
  // Filterable event explorer
  public static async getEvents(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const {
        datasetId,
        customerId,
        customerCode,
        channel,
        productCategory,
        eventType,
        customerSegment,
        purchaseStatus,
        search,
        page,
        limit,
      } = req.query;

      if (!datasetId) {
        return res.status(400).json({ error: 'datasetId parameter is required' });
      }

      // Verify dataset ownership
      const dataset = DatasetModel.findById(datasetId as string, userId);
      if (!dataset) {
        return res.status(404).json({ error: 'Dataset not found or unauthorized' });
      }

      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(100, Math.max(10, parseInt(limit as string) || 50));
      const offset = (pageNum - 1) * limitNum;

      const result = EventModel.findFiltered({
        datasetId: datasetId as string,
        customerId: customerId as string | undefined,
        customerCode: customerCode as string | undefined,
        channel: channel as string | undefined,
        productCategory: productCategory as string | undefined,
        eventType: eventType as string | undefined,
        customerSegment: customerSegment as string | undefined,
        purchaseStatus: purchaseStatus as string | undefined,
        search: search as string | undefined,
        limit: limitNum,
        offset,
      });

      return res.json({
        events: result.events,
        pagination: {
          total: result.total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(result.total / limitNum),
        },
      });
    } catch (err: any) {
      console.error('[Get Events Error]', err);
      return res.status(500).json({ error: 'Failed to retrieve journey events' });
    }
  }

  // Get customers for a dataset
  public static async getCustomers(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { datasetId } = req.params;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const dataset = DatasetModel.findById(datasetId, userId);
      if (!dataset) {
        return res.status(404).json({ error: 'Dataset not found or unauthorized' });
      }

      const customers = CustomerModel.findByDatasetId(datasetId);
      return res.json({ customers });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to retrieve customers' });
    }
  }

  // Get customer profile and sessions
  public static async getCustomerDetails(req: Request, res: Response) {
    try {
      const { customerId } = req.params;
      const customer = CustomerModel.findById(customerId);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      const sessions = SessionModel.findByCustomerId(customerId);
      return res.json({ customer, sessions });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to retrieve customer details' });
    }
  }

  // Visual journey timeline
  public static async getCustomerTimeline(req: Request, res: Response) {
    try {
      const { customerId } = req.params;
      const customer = CustomerModel.findById(customerId);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      const events = EventModel.findByCustomerId(customerId);
      const sessions = SessionModel.findByCustomerId(customerId);

      // Aggregate statistics for this customer
      const channels = Array.from(new Set(events.map((e) => e.channel)));
      const productsViewed = Array.from(
        new Set(events.filter((e) => e.product_name).map((e) => e.product_name!))
      );
      const cartAdditions = events.filter((e) => e.event_type === 'CART_ADD').length;
      const purchaseCompleted = events.some((e) => e.event_type === 'PURCHASE');

      // Group timeline by calendar day
      const dayGroups: Record<string, typeof events> = {};
      for (const ev of events) {
        const dayKey = ev.event_timestamp ? ev.event_timestamp.substring(0, 10) : 'Day 1';
        if (!dayGroups[dayKey]) {
          dayGroups[dayKey] = [];
        }
        dayGroups[dayKey].push(ev);
      }

      const groupedTimeline = Object.entries(dayGroups).map(([date, dayEvents], index) => ({
        dayIndex: index + 1,
        date,
        events: dayEvents,
      }));

      return res.json({
        customer,
        sessions,
        metrics: {
          totalInteractions: events.length,
          totalSessions: sessions.length,
          channelsUsed: channels,
          productsViewed,
          cartAdditions,
          purchaseStatus: purchaseCompleted ? 'COMPLETED' : 'NOT_COMPLETED',
          journeyDurationDays: groupedTimeline.length,
        },
        timeline: groupedTimeline,
        rawEvents: events,
      });
    } catch (err: any) {
      console.error('[Timeline Error]', err);
      return res.status(500).json({ error: 'Failed to generate customer timeline' });
    }
  }
}
