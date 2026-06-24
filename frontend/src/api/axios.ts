import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

// ── Axios Instance ────────────────────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: '/api',               // proxied to http://localhost:5000/api via vite.config.ts
  withCredentials: true,         // send the HTTP-only refresh cookie on every request
  timeout: 10_000,
});

// ── In-memory token store ─────────────────────────────────────────────────────
// Keeps the access token out of localStorage (XSS risk) while still being
// injectable into Authorization headers by the request interceptor.

let accessToken: string | null = null;

export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};

export const getAccessToken = (): string | null => accessToken;

// ── Request Interceptor — inject Bearer token ─────────────────────────────────

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken && config.headers) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ── Response Interceptor — silent token refresh on 401 ───────────────────────

let isRefreshing = false;
// Queue of callbacks waiting for the new token
let refreshQueue: Array<(token: string) => void> = [];

const processQueue = (newToken: string): void => {
  refreshQueue.forEach((cb) => cb(newToken));
  refreshQueue = [];
};

api.interceptors.response.use(
  // Pass successful responses straight through
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only intercept 401s that haven't been retried and are NOT from the refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/refresh' &&
      originalRequest.url !== '/auth/login'
    ) {
      if (isRefreshing) {
        // Another request is already refreshing — queue this one until done
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
        // Call the refresh endpoint — the cookie is sent automatically (withCredentials: true)
        const { data } = await api.post<{ data: { accessToken: string } }>('/auth/refresh');
        const newToken = data.data.accessToken;

        setAccessToken(newToken);
        processQueue(newToken);

        // Retry the original failed request with the new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        // Refresh failed — clear token and redirect to login
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
