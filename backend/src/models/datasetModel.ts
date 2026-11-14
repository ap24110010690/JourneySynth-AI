// backend/src/models/datasetModel.ts
import { db } from '../config/db.js';
import { DatasetRecord, GenerationConfig } from '../types/index.js';
import { GenerationResult } from '../services/markovEngine.js';
import crypto from 'crypto';

export class DatasetModel {
  public static findByUserId(userId: string): DatasetRecord[] {
    return db
      .prepare('SELECT * FROM datasets WHERE user_id = ? ORDER BY created_at DESC')
      .all(userId) as DatasetRecord[];
  }

  public static findById(id: string, userId: string): DatasetRecord | undefined {
    return db
      .prepare('SELECT * FROM datasets WHERE id = ? AND user_id = ?')
      .get(id, userId) as DatasetRecord | undefined;
  }

  public static delete(id: string, userId: string): boolean {
    const info = db.prepare('DELETE FROM datasets WHERE id = ? AND user_id = ?').run(id, userId);
    return info.changes > 0;
  }

  // Transactionally save dataset and all associated customers, sessions, and events
  public static saveGeneratedDataset(
    userId: string,
    config: GenerationConfig,
    result: GenerationResult
  ): DatasetRecord {
    const datasetId = crypto.randomUUID();

    const insertDataset = db.prepare(`
      INSERT INTO datasets (id, user_id, dataset_name, generation_config, total_customers, total_sessions, total_events)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const insertCustomer = db.prepare(`
      INSERT INTO customers (id, dataset_id, customer_code, customer_type, customer_name, email, location, device_preference)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertSession = db.prepare(`
      INSERT INTO sessions (id, dataset_id, customer_id, session_code, channel, started_at, ended_at, conversion_status, total_events)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertEvent = db.prepare(`
      INSERT INTO journey_events (id, dataset_id, customer_id, session_id, product_id, event_type, channel, event_timestamp, event_metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Execute within a single ACID transaction
    const executeTransaction = db.transaction(() => {
      insertDataset.run(
        datasetId,
        userId,
        config.datasetName.trim(),
        JSON.stringify(config),
        result.stats.totalCustomers,
        result.stats.totalSessions,
        result.stats.totalEvents
      );

      for (const c of result.customers) {
        insertCustomer.run(
          c.id,
          datasetId,
          c.customerCode,
          c.customerType,
          c.name,
          c.email,
          c.location,
          c.devicePreference
        );
      }

      for (const s of result.sessions) {
        insertSession.run(
          s.id,
          datasetId,
          s.customerId,
          s.sessionCode,
          s.channel,
          s.startedAt.toISOString(),
          s.endedAt.toISOString(),
          s.conversionStatus,
          s.totalEvents
        );
      }

      for (const e of result.events) {
        insertEvent.run(
          e.id,
          datasetId,
          e.customerId,
          e.sessionId,
          e.productId,
          e.eventType,
          e.channel,
          e.timestamp.toISOString(),
          JSON.stringify(e.metadata)
        );
      }
    });

    executeTransaction();
    return this.findById(datasetId, userId)!;
  }
}
