import { apiRequest } from './apiClient';
import type { Explanation } from '../types';

export interface CounterfactualResponse {
  originalForecast: any[];
  modifiedForecast: any[];
  trackDifferenceKm: number;
  intensityDifferenceKt: number;
  confidenceDifference: number;
  degradedMode: string;
}

export const explanationApi = {
  getExplanation: (stormId: string) =>
    apiRequest<Explanation>(`/storms/${stormId}/explanation`),
  runCounterfactual: (stormId: string, removeModality: string) =>
    apiRequest<CounterfactualResponse>('/explainability/counterfactual', {
      method: 'POST',
      body: JSON.stringify({ stormId, removeModality }),
    }),
};
