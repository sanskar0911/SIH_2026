import { apiRequest } from './apiClient';
import type { Alert } from '../types';

export const alertsApi = {
  getAlerts: () => apiRequest<Alert[]>('/alerts'),
  getAlert: (alertId: string) => apiRequest<Alert>(`/alerts/${alertId}`),
};
