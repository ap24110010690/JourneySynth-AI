// backend/src/config/env.ts
import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  JWT_SECRET: process.env.JWT_SECRET || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: parseInt(process.env.DB_PORT || '3306', 10),
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'journeysynth',
  USE_MYSQL: process.env.USE_MYSQL === 'true',
};

// Validate critical environment configurations
if (!ENV.JWT_SECRET) {
  if (ENV.NODE_ENV === 'production') {
    throw new Error('[FATAL] JWT_SECRET environment variable is missing. Set JWT_SECRET in production.');
  } else {
    console.warn('[WARN] JWT_SECRET is not set in environment. Please define JWT_SECRET in your .env file.');
  }
}

if (!ENV.GEMINI_API_KEY) {
  console.info('[INFO] GEMINI_API_KEY is not set. Gemini features will offer intelligent rule-based statistical fallbacks.');
}
