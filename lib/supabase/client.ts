import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.\n" +
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment (e.g. .env.local) for client-side use."
  );
}

// Prevent accidental use of a service role or secret key in the browser
if (supabaseAnonKey.includes("service_role") || supabaseAnonKey.length > 200) {
  throw new Error(
    "Refusing to initialize Supabase client in the browser with a secret/service role key.\n" +
      "Make sure you configured NEXT_PUBLIC_SUPABASE_ANON_KEY (the public anon key), not SUPABASE_SERVICE_ROLE_KEY."
  );
}

export function createClient() {
  return createSupabaseClient(supabaseUrl!, supabaseAnonKey!);
}
