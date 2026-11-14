// backend/src/models/userModel.ts
import { db } from '../config/db.js';
import { UserRecord } from '../types/index.js';
import crypto from 'crypto';

export class UserModel {
  public static findByEmail(email: string): UserRecord | undefined {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as UserRecord | undefined;
  }

  public static findById(id: string): UserRecord | undefined {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRecord | undefined;
  }

  public static create(name: string, email: string, passwordHash: string): UserRecord {
    const id = crypto.randomUUID();
    const cleanEmail = email.toLowerCase().trim();
    const stmt = db.prepare(`
      INSERT INTO users (id, name, email, password_hash)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, name.trim(), cleanEmail, passwordHash);
    return this.findById(id)!;
  }
}
