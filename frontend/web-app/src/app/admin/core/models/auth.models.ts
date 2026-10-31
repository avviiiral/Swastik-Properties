export type AppRole = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR' | 'AGENT';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: AppRole;
  is_active: boolean;
  date_joined: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: AuthUser;
}
export interface RefreshResponse { access: string; refresh?: string; }
