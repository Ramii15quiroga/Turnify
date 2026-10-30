import { Service } from './service';
import { User } from './auth';

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface Appointment {
  id: string;
  userId: string;
  serviceId: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  cancellationReason?: string | null;
  createdAt: string;
  updatedAt?: string;
  service: Service;
  user?: Partial<User>;
}

export interface AvailabilityResponse {
  date: string;
  serviceId: string;
  availableSlots: string[];
  message?: string;
}

