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



const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true, 
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

    case 'UPDATE_USER':
      return { ...state, user: action.payload.user };

    case 'LOGOUT':
      return { ...initialState, isLoading: false };

    default:
      return state;
  }
};



interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}



const AuthContext = createContext<AuthContextValue | null>(null);



interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  
  
  
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

  
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const { data } = await api.post<{ data: { user: User; accessToken: string } }>(
      '/auth/login',
      { email, password }
    );
    setAccessToken(data.data.accessToken);
    dispatch({ type: 'AUTH_SUCCESS', payload: data.data });
  }, []);

  
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

  
  const logout = useCallback(async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const updateUser = useCallback((user: User) => {
    dispatch({ type: 'UPDATE_USER', payload: { user } });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};



export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
};
