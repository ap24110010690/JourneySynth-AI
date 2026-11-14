// backend/src/controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModel.js';
import { ENV } from '../config/env.js';
import { validateEmail } from '../utils/validators.js';

export class AuthController {
  public static async register(req: Request, res: Response) {
    try {
      const { name, email, password, confirmPassword } = req.body;

      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: 'Full name is required.' });
      }

      if (!email || !validateEmail(email)) {
        return res.status(400).json({ error: 'A valid email address is required.' });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match.' });
      }

      const existingUser = UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = UserModel.create(name, email, passwordHash);

      const token = jwt.sign({ id: user.id, email: user.email }, ENV.JWT_SECRET, {
        expiresIn: '7d',
      });

      return res.status(201).json({
        message: 'Account created successfully.',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (err: any) {
      console.error('[Register Error]', err);
      return res.status(500).json({ error: 'Failed to create account.' });
    }
  }

  public static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const user = UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, ENV.JWT_SECRET, {
        expiresIn: '7d',
      });

      return res.json({
        message: 'Login successful.',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (err: any) {
      console.error('[Login Error]', err);
      return res.status(500).json({ error: 'Failed to log in.' });
    }
  }

  public static async me(req: Request, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    return res.json({ user: req.user });
  }

  public static async logout(req: Request, res: Response) {
    return res.json({ message: 'Logged out successfully.' });
  }
}
