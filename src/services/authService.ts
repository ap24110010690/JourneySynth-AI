// src/services/authService.ts
import { api } from './api';
import { User } from '../types/frontend';

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export const authService = {
  async register(data: { name: string; email: string; password: string; confirmPassword: string }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await api.get<{ user: User }>('/auth/me');
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('journeysynth_token');
      localStorage.removeItem('journeysynth_user');
    }
  },
};
