// Neleidžia rodyti žalio HTML klaidų teksto vartotojui.
export function safeErrorMessage(message) {
  if (!message) return "Nežinoma klaida";

  if (message.includes("<!DOCTYPE") || message.includes("<html")) {
    return "Neteisingai sukonfigūruotas SUPABASE_URL. Vercel → Settings → Environment Variables: naudokite https://xxxxx.supabase.co (ne dashboard nuorodą), tada Redeploy.";
  }

  if (message.length > 300) {
    return message.slice(0, 300) + "…";
  }

  return message;
}
