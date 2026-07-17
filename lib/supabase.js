import { createClient } from "@supabase/supabase-js";

// Naudojame SERVICE_ROLE raktą serverio pusėje (API routes), kad galėtume
// skaityti/rašyti nepaisant Row Level Security taisyklių.
export function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Trūksta SUPABASE_URL arba SUPABASE_SERVICE_ROLE_KEY aplinkos kintamųjų"
    );
  }

  return createClient(url, key);
}
