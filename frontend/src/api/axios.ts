import { supabase } from "../../lib/supabaseClient";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

interface RequestConfig {
  method: string;
  headers: Record<string, string>;
  body?: string;
}

async function request(path: string, options: Partial<RequestConfig> = {}) {
  // Get auth token from Supabase
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  const url = path.startsWith("/")
    ? `${API_BASE}${path}`
    : `${API_BASE}/${path}`;

  const config: RequestConfig = {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  if (options.body) {
    config.body = options.body;
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }

  return data;
}

const api = {
  get: (path: string) => request(path, { method: "GET" }),

  post: (path: string, body?: any) =>
    request(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: (path: string, body?: any) =>
    request(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: (path: string, body?: any) =>
    request(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: (path: string, body?: any) =>
    request(path, {
      method: "DELETE",
      body: body ? JSON.stringify(body) : undefined,
    }),
};

export default api;
