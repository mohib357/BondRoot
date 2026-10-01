import { Capacitor } from '@capacitor/core';

export const DEFAULT_LIVE_API_URL = 'https://bondroot.onrender.com';

/**
 * Returns the base URL for API requests.
 * Priority:
 * 1. Saved URL in localStorage ('bondroot_api_url')
 * 2. VITE_API_URL environment variable
 * 3. Default Live Server ('https://bondroot.onrender.com')
 */
export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const savedUrl = localStorage.getItem('bondroot_api_url');
    if (savedUrl && savedUrl.trim()) {
      return savedUrl.trim().replace(/\/$/, '');
    }
  }

  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/$/, '');
  }

  return DEFAULT_LIVE_API_URL;
};

/**
 * Constructs a full API URL for a given path.
 */
export const getApiUrl = (path: string): string => {
  const baseUrl = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

/**
 * Wrapper for fetch that automatically prepends the API base URL.
 */
export const apiFetch = (path: string, init?: RequestInit): Promise<Response> => {
  return fetch(getApiUrl(path), init);
};
