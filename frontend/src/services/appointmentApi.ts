import { apiRequest } from './api';
import { Appointment, AvailabilityResponse } from '../types/appointment';

export const appointmentApi = {
  getAvailability: (serviceId: string, date: string) =>
    apiRequest<AvailabilityResponse>(`/availability?serviceId=${encodeURIComponent(serviceId)}&date=${encodeURIComponent(date)}`),

  createAppointment: (data: { serviceId: string; date: string; time: string }) =>
    apiRequest<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMyAppointments: () =>
    apiRequest<Appointment[]>('/appointments/my'),

  cancelAppointment: (id: string, reason?: string) =>
    apiRequest<Appointment>(`/appointments/${id}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),

  getAdminAppointments: (filters: { date?: string; serviceId?: string; status?: string } = {}) => {
    const params = new URLSearchParams();
    if (filters.date) params.append('date', filters.date);
    if (filters.serviceId) params.append('serviceId', filters.serviceId);
    if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
    const queryString = params.toString();
    return apiRequest<Appointment[]>(`/admin/appointments${queryString ? `?${queryString}` : ''}`);
  },

  getAdminAppointmentById: (id: string) =>
    apiRequest<Appointment>(`/admin/appointments/${id}`),
};

