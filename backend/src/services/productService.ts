// backend/src/services/productService.ts
import { db } from '../config/db.js';
import { ProductRecord } from '../types/index.js';

export class ProductService {
  public static getAll(): ProductRecord[] {
    return db.prepare('SELECT * FROM products ORDER BY category, name').all() as ProductRecord[];
  }

  public static getById(id: string): ProductRecord | undefined {
    return db.prepare('SELECT * FROM products WHERE id = ?').get(id) as ProductRecord | undefined;
  }

  public static getByCategory(category: string): ProductRecord[] {
    return db.prepare('SELECT * FROM products WHERE category = ?').all(category) as ProductRecord[];
  }
}
