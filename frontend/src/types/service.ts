export interface Service {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

