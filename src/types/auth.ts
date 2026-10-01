export type UserRole = 'super_admin' | 'admin' | 'member';

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string | null;
  username?: string | null;
  role: UserRole;
  avatar_url?: string | null;
  created_at?: string;
  family_count?: number;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
  message?: string;
}
