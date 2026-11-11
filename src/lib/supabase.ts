import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

let browserClient: SupabaseClient | null = null;

export function hasSupabaseEnv(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function getBrowserSupabase(): SupabaseClient | null {
  if (!hasSupabaseEnv()) return null;
  if (typeof window === 'undefined') return null;
  if (!browserClient) {
    browserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return browserClient;
}

// Fast-fail tracking for restricted sandbox containers where server outbound is firewalled
let serverOutboundReachable: boolean | null = null;

export function isServerSupabaseKnownBlocked(): boolean {
  return serverOutboundReachable === false;
}

export function markServerSupabaseBlocked(): void {
  serverOutboundReachable = false;
}

export function markServerSupabaseReachable(): void {
  serverOutboundReachable = true;
}

export function createServerSupabase(): SupabaseClient | null {
  if (!hasSupabaseEnv()) return null;
  if (serverOutboundReachable === false) return null;

  const serviceOrAnonKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

  return createClient(SUPABASE_URL, serviceOrAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: async (input, init) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 1400);
        try {
          const res = await fetch(input, {
            ...init,
            signal: init?.signal ?? controller.signal,
          });
          markServerSupabaseReachable();
          return res;
        } catch (err) {
          markServerSupabaseBlocked();
          throw err;
        } finally {
          clearTimeout(timer);
        }
      },
    },
  });
}
