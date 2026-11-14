// backend/src/utils/validators.ts
import { GenerationConfig } from '../types/index.js';

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validateGenerationConfig(config: Partial<GenerationConfig>): { isValid: boolean; error?: string } {
  if (!config.datasetName || config.datasetName.trim().length === 0) {
    return { isValid: false, error: 'Dataset name is required' };
  }

  if (!config.totalCustomers || config.totalCustomers < 1 || config.totalCustomers > 2000) {
    return { isValid: false, error: 'Total customers must be between 1 and 2,000' };
  }

  if (!config.channels || config.channels.length === 0) {
    return { isValid: false, error: 'At least one omnichannel touchpoint must be selected' };
  }

  if (!config.categories || config.categories.length === 0) {
    return { isValid: false, error: 'At least one product category must be selected' };
  }

  if (!config.segments || config.segments.length === 0) {
    return { isValid: false, error: 'At least one customer segment must be selected' };
  }

  if (config.durationDays !== undefined && (config.durationDays < 1 || config.durationDays > 60)) {
    return { isValid: false, error: 'Duration days must be between 1 and 60' };
  }

  return { isValid: true };
}
