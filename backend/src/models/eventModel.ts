// backend/src/models/eventModel.ts
import { db } from '../config/db.js';
import { JourneyEventRecord } from '../types/index.js';

export interface EventFilterOptions {
  datasetId: string;
  customerId?: string;
  customerCode?: string;
  channel?: string;
  productCategory?: string;
  eventType?: string;
  customerSegment?: string;
  purchaseStatus?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface JoinedEventRow {
  id: string;
  dataset_id: string;
  customer_id: string;
  customer_code: string;
  customer_name: string;
  customer_type: string;
  session_id: string;
  session_code: string;
  product_id: string | null;
  product_name: string | null;
  product_category: string | null;
  product_price: number | null;
  event_type: string;
  channel: string;
  event_timestamp: string;
  event_metadata: string | null;
  conversion_status: string;
}

export class EventModel {
  public static findByCustomerId(customerId: string): JoinedEventRow[] {
    const query = `
      SELECT 
        e.*,
        c.customer_code,
        c.customer_name,
        c.customer_type,
        s.session_code,
        s.conversion_status,
        p.name as product_name,
        p.category as product_category,
        p.price as product_price
      FROM journey_events e
      JOIN customers c ON e.customer_id = c.id
      JOIN sessions s ON e.session_id = s.id
      LEFT JOIN products p ON e.product_id = p.id
      WHERE e.customer_id = ?
      ORDER BY e.event_timestamp ASC
    `;
    return db.prepare(query).all(customerId) as JoinedEventRow[];
  }

  public static findFiltered(options: EventFilterOptions): { events: JoinedEventRow[]; total: number } {
    let whereClauses: string[] = ['e.dataset_id = @datasetId'];
    const params: Record<string, any> = { datasetId: options.datasetId };

    if (options.customerId) {
      whereClauses.push('e.customer_id = @customerId');
      params.customerId = options.customerId;
    }

    if (options.customerCode) {
      whereClauses.push('c.customer_code LIKE @customerCode');
      params.customerCode = `%${options.customerCode}%`;
    }

    if (options.channel) {
      whereClauses.push('e.channel = @channel');
      params.channel = options.channel;
    }

    if (options.eventType) {
      whereClauses.push('e.event_type = @eventType');
      params.eventType = options.eventType;
    }

    if (options.customerSegment) {
      whereClauses.push('c.customer_type = @customerSegment');
      params.customerSegment = options.customerSegment;
    }

    if (options.purchaseStatus) {
      whereClauses.push('s.conversion_status = @purchaseStatus');
      params.purchaseStatus = options.purchaseStatus;
    }

    if (options.productCategory) {
      whereClauses.push('p.category = @productCategory');
      params.productCategory = options.productCategory;
    }

    if (options.search) {
      whereClauses.push(
        '(c.customer_code LIKE @search OR c.customer_name LIKE @search OR p.name LIKE @search OR e.event_type LIKE @search)'
      );
      params.search = `%${options.search}%`;
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countQuery = `
      SELECT COUNT(*) as count
      FROM journey_events e
      JOIN customers c ON e.customer_id = c.id
      JOIN sessions s ON e.session_id = s.id
      LEFT JOIN products p ON e.product_id = p.id
      ${whereSql}
    `;

    const total = (db.prepare(countQuery).get(params) as { count: number }).count;

    const limit = options.limit || 50;
    const offset = options.offset || 0;
    params.limit = limit;
    params.offset = offset;

    const dataQuery = `
      SELECT 
        e.*,
        c.customer_code,
        c.customer_name,
        c.customer_type,
        s.session_code,
        s.conversion_status,
        p.name as product_name,
        p.category as product_category,
        p.price as product_price
      FROM journey_events e
      JOIN customers c ON e.customer_id = c.id
      JOIN sessions s ON e.session_id = s.id
      LEFT JOIN products p ON e.product_id = p.id
      ${whereSql}
      ORDER BY e.event_timestamp ASC
      LIMIT @limit OFFSET @offset
    `;

    const events = db.prepare(dataQuery).all(params) as JoinedEventRow[];
    return { events, total };
  }

  public static getAllForExport(datasetId: string): JoinedEventRow[] {
    const query = `
      SELECT 
        e.id,
        e.dataset_id,
        e.customer_id,
        c.customer_code,
        c.customer_type,
        c.customer_name,
        e.session_id,
        s.session_code,
        s.conversion_status,
        e.product_id,
        p.name as product_name,
        p.category as product_category,
        p.price as product_price,
        e.event_type,
        e.channel,
        e.event_timestamp,
        e.event_metadata
      FROM journey_events e
      JOIN customers c ON e.customer_id = c.id
      JOIN sessions s ON e.session_id = s.id
      LEFT JOIN products p ON e.product_id = p.id
      WHERE e.dataset_id = ?
      ORDER BY e.event_timestamp ASC
    `;
    return db.prepare(query).all(datasetId) as JoinedEventRow[];
  }
}
