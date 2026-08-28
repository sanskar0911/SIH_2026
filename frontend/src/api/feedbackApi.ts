import { apiRequest } from './apiClient';
import type { Annotation } from '../types';

export const feedbackApi = {
  saveAnnotation: (annotation: Annotation) =>
    apiRequest<Annotation>('/feedback/annotation', {
      method: 'POST',
      body: JSON.stringify(annotation),
    }),
};
