import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://uavlqrapmcuhlhrtfvri.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhdmxxcmFwbWN1aGxocnRmdnJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMTE1MzQsImV4cCI6MjA5MzU4NzUzNH0.niba_kFTb9NS_wNBIFwGOktHwpDooHk4KmM-oc9HYQs";

// Conditionally import ws for Node.js environments
const isServer = typeof window === "undefined";
let transport;

if (isServer) {
  // Using dynamic import to avoid bundling 'ws' on the client
  const ws = await import("ws");
  transport = ws.default;
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    fetch: (...args) => fetch(...args),
  },
  realtime: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transport: transport as any,
  },
});
