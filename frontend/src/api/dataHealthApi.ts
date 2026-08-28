import { apiRequest } from './apiClient';
import type { DataHealth } from '../types';

export const dataHealthApi = {
  getDataHealth: () => apiRequest<DataHealth>('/data-health'),
};
