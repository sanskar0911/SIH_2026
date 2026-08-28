import { apiRequest } from './apiClient';
import type { ScenarioId } from '../mockService';

export interface SystemStatus {
  scenario: ScenarioId;
  analysis_status: string;
  last_analysis_time: string;
  modalities: Record<string, string>;
}

export const systemApi = {
  getHealth: () => apiRequest<any>('/system/health'),
  getStatus: () => apiRequest<SystemStatus>('/system/status'),
  setScenario: (scenario: ScenarioId) =>
    apiRequest<any>('/system/scenario', {
      method: 'POST',
      body: JSON.stringify({ scenario }),
    }),
};
