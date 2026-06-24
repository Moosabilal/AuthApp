import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';



const api: AxiosInstance = axios.create({
  baseURL: '/api',               
  withCredentials: true,         
  timeout: 60_000,
});





let accessToken: string | null = null;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

export const getAccessToken = (): string | null => accessToken;



api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});



let isRefreshing = false;

let refreshQueue: Array<(token: string) => void> = [];

const processQueue = (newToken: string): void => {
  refreshQueue.forEach((cb) => cb(newToken));
  refreshQueue = [];
};

api.interceptors.response.use(
  
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/refresh' &&
      originalRequest.url !== '/auth/login'
    ) {
      if (isRefreshing) {
        
        return new Promise<unknown>((resolve) => {
          refreshQueue.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        
        const { data } = await api.post<{ data: { accessToken: string } }>('/auth/refresh');
        const newToken = data.data.accessToken;

        setAccessToken(newToken);
        processQueue(newToken);

        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        
        setAccessToken(null);
        refreshQueue = [];
        window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
