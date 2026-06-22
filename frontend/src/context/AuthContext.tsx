import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import api, { setAccessToken } from '@/api/axios';
import { User, AuthState, AuthAction } from '@/types/auth.types';

// ── Reducer ───────────────────────────────────────────────────────────────────

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true, // true on mount: we attempt a silent refresh before rendering
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_INIT_START':
      return { ...state, isLoading: true };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        isLoading: false,
      };

    case 'AUTH_FAILURE':
      return { ...initialState, isLoading: false };

    case 'UPDATE_TOKEN':
      return { ...state, accessToken: action.payload.accessToken };

    case 'LOGOUT':
      return { ...initialState, isLoading: false };

    default:
      return state;
  }
};

// ── Context Types ─────────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ── Silent refresh on mount ────────────────────────────────────────────────
  // Attempts to restore the session from the HTTP-only cookie without requiring
  // the user to log in again after a page reload.
  useEffect(() => {
    const initAuth = async () => {
      dispatch({ type: 'AUTH_INIT_START' });
      try {
        const { data } = await api.post<{
          data: { user: User; accessToken: string };
        }>('/auth/refresh');
        setAccessToken(data.data.accessToken);
        dispatch({ type: 'AUTH_SUCCESS', payload: data.data });
      } catch {
        dispatch({ type: 'AUTH_FAILURE' });
      }
    };

    void initAuth();
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const { data } = await api.post<{ data: { user: User; accessToken: string } }>(
      '/auth/login',
      { email, password }
    );
    setAccessToken(data.data.accessToken);
    dispatch({ type: 'AUTH_SUCCESS', payload: data.data });
  }, []);

  // ── Signup ─────────────────────────────────────────────────────────────────
  const signup = useCallback(
    async (name: string, email: string, password: string): Promise<void> => {
      const { data } = await api.post<{ data: { user: User; accessToken: string } }>(
        '/auth/signup',
        { name, email, password }
      );
      setAccessToken(data.data.accessToken);
      dispatch({ type: 'AUTH_SUCCESS', payload: data.data });
    },
    []
  );

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
};
