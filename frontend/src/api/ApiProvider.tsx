import React, { createContext, useContext, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "../../lib/supabaseClient";

// Api Client  + get + post + patch: hỗ trợ gọi api eg api.get("/users")
interface ApiClient {
  apiBase: string;
  get: (path: string) => Promise<any>;
  post: (path: string, body?: any) => Promise<any>;
  patch: (path: string, body?: any) => Promise<any>;
}

// Context chứa api client
const ApiContext = createContext<ApiClient | null>(null);

function resolveBase(propBase?: string) {
  // priority: prop -> runtime window.__APP_CONFIG__ -> Vite env -> fallback
  const runtime = typeof (window as any) !== "undefined" ? (window as any).__APP_CONFIG__?.apiBase : undefined;
  const vite = typeof import.meta !== "undefined" ? (import.meta as any).env?.VITE_API_BASE : undefined;
  return propBase ?? runtime ?? vite ?? "http://localhost:3000/api";
}

// Apiprovider - tạo client và đưa nó vào context
export function ApiProvider({ apiBase, children }: { apiBase?: string; children: React.ReactNode }) {
  const base = useMemo(() => resolveBase(apiBase), [apiBase]);

  const queryClient = useMemo(() => new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false } } }), []);

  const client: ApiClient = useMemo(() => {
    const makeUrl = (path: string) => (path.startsWith("/") ? `${base}${path}` : `${base}/${path}`);

    async function handleRes(res: Response) {
      const text = await res.text();
      try {
        const json = text ? JSON.parse(text) : null;
        if (!res.ok) throw new Error(json?.error?.message ?? json?.message ?? `HTTP ${res.status}`);

        // Normalize response shape: if server returns bare array/object, wrap it so
        // client code can consistently read `response.data` and `response.success`.
        if (json && typeof json === "object") {
          // If already using { data: ..., success?: ... } shape, return as-is
          if (Array.isArray(json) || (!("data" in json) && !("success" in json))) {
            return { success: true, data: json };
          }
          return json;
        }

        // For primitive responses (text/number) when status ok, return as data
        return { success: true, data: json };
      } catch (err) {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${text}`);
        // if json parse failed but status ok, return raw text as data
        return { success: true, data: text };
      }
    }

    // helper that forces no-cache for debugging / fresh data
    async function fetchNoCache(input: RequestInfo, init?: RequestInit) {
      // try to get current access token from supabase client
      let token: string | undefined;
      try {
        const s = await supabase.auth.getSession();
        token = s?.data?.session?.access_token;
      } catch (e) {
        // ignore if supabase not available
      }

      const baseHeaders: Record<string, string> = {
        "Cache-Control": "no-store",
        ...(init && (init.headers as Record<string, string>)),
      };
      if (token) baseHeaders["Authorization"] = `Bearer ${token}`;

      const merged: RequestInit = {
        ...(init || {}),
        cache: "no-store",
        credentials: (init && init.credentials) || "include",
        headers: baseHeaders,
      };
      return fetch(input, merged as RequestInit);
    }

    const clientObj: ApiClient = {
      apiBase: base,
      get: async (path: string) => {
        const res = await fetchNoCache(makeUrl(path));
        return handleRes(res);
      },
      post: async (path: string, body?: any) => {
        const res = await fetchNoCache(makeUrl(path), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        return handleRes(res);
      },
      patch: async (path: string, body?: any) => {
        const res = await fetchNoCache(makeUrl(path), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: body !== undefined ? JSON.stringify(body) : undefined,
        });
        return handleRes(res);
      },
    };

    // expose for quick debugging in browser console
    try {
      (window as any).__API_CLIENT__ = clientObj;
      (window as any).fetchNoCache = fetchNoCache;
    } catch (e) {
      // ignore in non-browser environments
    }

    return clientObj;
  }, [base]);

  return (
    <ApiContext.Provider value={client}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ApiContext.Provider>
  );
}

export function useApi() {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error("useApi must be used inside ApiProvider");
  return ctx;
}

export default ApiContext;
