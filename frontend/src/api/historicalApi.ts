import { apiRequest } from './apiClient';
import type { HistoricalStorm } from '../types';

export const historicalApi = {
  getHistoricalStorms: () => apiRequest<HistoricalStorm[]>('/historical'),
  getHistoricalReplay: (stormId: string) =>
    apiRequest<HistoricalStorm>(`/historical/${stormId}/replay`),
};
