import { createClient } from "@supabase/supabase-js";

// Naudojame SERVICE_ROLE raktą serverio pusėje (API routes), kad galėtume
// skaityti/rašyti nepaisant Row Level Security taisyklių.
export function getSupabase() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !key) {
    throw new Error(
      "Trūksta SUPABASE_URL arba SUPABASE_SERVICE_ROLE_KEY aplinkos kintamųjų"
    );
  }

  if (!url.includes(".supabase.co")) {
    throw new Error(
      "SUPABASE_URL turi būti Project URL (pvz. https://xxxxx.supabase.co), ne Supabase dashboard nuoroda"
    );
  }

  return createClient(url, key);
}
