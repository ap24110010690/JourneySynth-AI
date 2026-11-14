// backend/src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { UserModel } from '../models/userModel.js';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as { id: string; email: string };

    const user = UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Invalid authentication token. User not found.' });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    next();
  } catch (err: any) {
    return res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' });
  }
}
