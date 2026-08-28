import { apiRequest } from './apiClient';
import type { ModelPerformance, ModelVersion } from '../types';

export const modelApi = {
  getModelPerformance: () => apiRequest<ModelPerformance>('/metrics/operational'),
  getModelVersion: () => apiRequest<ModelVersion>('/models/version'),
};
