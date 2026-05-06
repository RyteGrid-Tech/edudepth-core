import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://uavlqrapmcuhlhrtfvri.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhdmxxcmFwbWN1aGxocnRmdnJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMTE1MzQsImV4cCI6MjA5MzU4NzUzNH0.niba_kFTb9NS_wNBIFwGOktHwpDooHk4KmM-oc9HYQs";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
