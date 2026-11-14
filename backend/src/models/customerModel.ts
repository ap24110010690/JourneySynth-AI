// backend/src/models/customerModel.ts
import { db } from '../config/db.js';
import { CustomerRecord } from '../types/index.js';

export class CustomerModel {
  public static findByDatasetId(datasetId: string): CustomerRecord[] {
    return db
      .prepare('SELECT * FROM customers WHERE dataset_id = ? ORDER BY customer_code ASC')
      .all(datasetId) as CustomerRecord[];
  }

  public static findById(id: string): CustomerRecord | undefined {
    return db.prepare('SELECT * FROM customers WHERE id = ?').get(id) as CustomerRecord | undefined;
  }

  public static findByCode(code: string, datasetId: string): CustomerRecord | undefined {
    return db
      .prepare('SELECT * FROM customers WHERE customer_code = ? AND dataset_id = ?')
      .get(code, datasetId) as CustomerRecord | undefined;
  }
}
