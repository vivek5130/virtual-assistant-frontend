import { config } from '../config/constants';

// Single HTTP client. Browser only talks to the backend; no AI keys in the frontend.
const BASE = config.apiBase;
const TOKEN_KEY = config.storageKeys.token;
const GUEST_KEY = config.storageKeys.guest;

const storage = {
  get(key: string) {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key: string, value: string | null) {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch { /* private mode */ }
  },
};

export function getToken() { return storage.get(TOKEN_KEY); }
export function setToken(token: string | null) { storage.set(TOKEN_KEY, token); }

export function guestId() {
  let id = storage.get(GUEST_KEY);
  if (!id) {
    id = `g-${crypto.randomUUID()}`;
    storage.set(GUEST_KEY, id);
  }
  return id;
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

type Options = { method?: string; body?: unknown; form?: FormData; signal?: AbortSignal };

export async function api<T>(path: string, { method = 'GET', body, form, signal }: Options = {}): Promise<T> {
  const headers: Record<string, string> = { 'X-Guest-Id': guestId() };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
    signal,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) setToken(null);
    throw new ApiError(res.status, data.error || res.statusText, data.details);
  }
  return data as T;
}

export const qs = (params: Record<string, string | number | boolean | undefined | null>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') search.set(k, String(v));
  });
  const s = search.toString();
  return s ? `?${s}` : '';
};
