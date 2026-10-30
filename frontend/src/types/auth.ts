export type Role = 'CLIENT' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}
