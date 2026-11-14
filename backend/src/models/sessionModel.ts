// backend/src/models/sessionModel.ts
import { db } from '../config/db.js';
import { SessionRecord } from '../types/index.js';

export class SessionModel {
  public static findByCustomerId(customerId: string): SessionRecord[] {
    return db
      .prepare('SELECT * FROM sessions WHERE customer_id = ? ORDER BY started_at ASC')
      .all(customerId) as SessionRecord[];
  }

  public static findByDatasetId(datasetId: string): SessionRecord[] {
    return db
      .prepare('SELECT * FROM sessions WHERE dataset_id = ? ORDER BY started_at ASC')
      .all(datasetId) as SessionRecord[];
  }

  public static findById(id: string): SessionRecord | undefined {
    return db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as SessionRecord | undefined;
  }
}
