// ── Shared frontend types ─────────────────────────────────────────────────────

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type AuthAction =
  | { type: 'AUTH_INIT_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; accessToken: string } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'UPDATE_TOKEN'; payload: { accessToken: string } }
  | { type: 'LOGOUT' };
