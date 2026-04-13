const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const getDefaultApiBaseUrl = () => {
  if (typeof window === 'undefined') return '';

  const host = window.location.hostname;
  const isLoopback =
    host === '127.0.0.1' ||
    host === '[::1]' ||
    host === '::1';

  if (!isLoopback) {
    // Production-friendly default: same-origin routing (proxy/reverse-proxy).
    return '';
  }

  return `${window.location.protocol}//127.0.0.1:5000`;
};

const configuredApiBase = (import.meta.env.VITE_CHAT_API_URL || '').trim();

export const CHAT_API_BASE_URL = configuredApiBase
  ? trimTrailingSlash(configuredApiBase)
  : getDefaultApiBaseUrl();

export const buildApiUrl = (path: string) => {
  if (!path.startsWith('/')) return `${CHAT_API_BASE_URL}/${path}`;
  return `${CHAT_API_BASE_URL}${path}`;
};
