import { apiRequest } from './apiClient';
import type { Storm } from '../types';

export const stormsApi = {
  getCurrentStorms: () => apiRequest<Storm[]>('/storms/current'),
  getStorm: (stormId: string) => apiRequest<Storm>(`/storms/${stormId}`),
  getStormHistory: (stormId: string) => apiRequest<any>(`/storms/${stormId}/history`),
};
