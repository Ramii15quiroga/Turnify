import { apiRequest } from './api';
import { Service } from '../types/service';

export const serviceApi = {
  getActiveServices: () => apiRequest<Service[]>('/services'),
  getServiceById: (id: string) => apiRequest<Service>(`/services/${id}`),
  getAllAdminServices: () => apiRequest<Service[]>('/admin/services'),
  createService: (data: { name: string; description: string; durationMinutes: number }) =>
    apiRequest<Service>('/admin/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateService: (id: string, data: Partial<Service>) =>
    apiRequest<Service>(`/admin/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deactivateService: (id: string) =>
    apiRequest<Service>(`/admin/services/${id}/deactivate`, {
      method: 'PATCH',
    }),
};

