// backend/src/services/exportService.ts
import { EventModel } from '../models/eventModel.js';
import { CustomerModel } from '../models/customerModel.js';
import { SessionModel } from '../models/sessionModel.js';
import { DatasetModel } from '../models/datasetModel.js';
import { generateCsv } from '../utils/csv.js';

export class ExportService {
  public static exportDatasetToCsv(datasetId: string): string {
    const events = EventModel.getAllForExport(datasetId);

    const headers = [
      'event_id',
      'dataset_id',
      'customer_id',
      'session_id',
      'timestamp',
      'channel',
      'product_id',
      'product_category',
      'action',
      'purchase_status',
      'customer_type',
    ];

    const rows = events.map((e) => [
      e.id,
      e.dataset_id,
      e.customer_code,
      e.session_code,
      e.event_timestamp,
      e.channel,
      e.product_id || '',
      e.product_category || 'N/A',
      e.event_type,
      e.conversion_status,
      e.customer_type,
    ]);

    return generateCsv(headers, rows);
  }

  public static exportDatasetToJson(datasetId: string, userId: string): any {
    const dataset = DatasetModel.findById(datasetId, userId);
    if (!dataset) return null;

    const customers = CustomerModel.findByDatasetId(datasetId);
    const sessions = SessionModel.findByDatasetId(datasetId);
    const events = EventModel.getAllForExport(datasetId);

    // Group sessions by customer
    const sessionsByCustomer: Record<string, any[]> = {};
    for (const s of sessions) {
      if (!sessionsByCustomer[s.customer_id]) {
        sessionsByCustomer[s.customer_id] = [];
      }
      sessionsByCustomer[s.customer_id].push(s);
    }

    // Group events by session
    const eventsBySession: Record<string, any[]> = {};
    for (const e of events) {
      if (!eventsBySession[e.session_id]) {
        eventsBySession[e.session_id] = [];
      }
      eventsBySession[e.session_id].push({
        eventId: e.id,
        eventType: e.event_type,
        channel: e.channel,
        timestamp: e.event_timestamp,
        product: e.product_id
          ? {
              id: e.product_id,
              name: e.product_name,
              category: e.product_category,
              price: e.product_price,
            }
          : null,
        metadata: e.event_metadata ? JSON.parse(e.event_metadata) : {},
      });
    }

    const structuredCustomers = customers.map((c) => {
      const cSessions = (sessionsByCustomer[c.id] || []).map((s) => ({
        sessionId: s.id,
        sessionCode: s.session_code,
        channel: s.channel,
        startedAt: s.started_at,
        endedAt: s.ended_at,
        conversionStatus: s.conversion_status,
        totalEvents: s.total_events,
        events: eventsBySession[s.id] || [],
      }));

      return {
        customerId: c.id,
        customerCode: c.customer_code,
        customerType: c.customer_type,
        name: c.customer_name,
        email: c.email,
        location: c.location,
        devicePreference: c.device_preference,
        sessions: cSessions,
      };
    });

    return {
      metadata: {
        platform: 'JourneySynth AI',
        exportedAt: new Date().toISOString(),
        datasetId: dataset.id,
        datasetName: dataset.dataset_name,
        configuration: JSON.parse(dataset.generation_config),
        totalCustomers: dataset.total_customers,
        totalSessions: dataset.total_sessions,
        totalEvents: dataset.total_events,
      },
      customers: structuredCustomers,
    };
  }
}
