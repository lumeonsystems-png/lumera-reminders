// Diagnostika: ar Vercel aplinkos kintamieji teisingi (be slaptų reikšmių rodymo).
export async function GET() {
  const url = process.env.SUPABASE_URL?.trim() || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || "";

  let host = "";
  try {
    host = url ? new URL(url).hostname : "";
  } catch {
    host = "(neteisingas URL formatas)";
  }

  const urlOk = host.endsWith(".supabase.co");

  const smtpHost = process.env.SMTP_HOST?.trim() || "";
  const smtpUser = process.env.SMTP_USER?.trim() || "";
  const smtpPass = process.env.SMTP_PASS?.trim() || "";
  const smtpOk = !!(smtpHost && smtpUser && smtpPass);

  return Response.json({
    ok: urlOk && key.length > 0 && smtpOk,
    supabase: {
      url_set: url.length > 0,
      url_host: host || null,
      url_ok: urlOk,
      key_set: key.length > 0,
    },
    smtp: {
      host_set: smtpHost.length > 0,
      user_set: smtpUser.length > 0,
      pass_set: smtpPass.length > 0,
      port_set: !!(process.env.SMTP_PORT?.trim()),
      from_set: !!(process.env.SMTP_FROM?.trim()),
    },
    hint: !urlOk
      ? "SUPABASE_URL Vercel projekte turi būti https://xxxxx.supabase.co (ne dashboard nuoroda). Po pakeitimo būtina Redeploy."
      : !key
        ? "Trūksta SUPABASE_SERVICE_ROLE_KEY Vercel projekte."
        : !smtpOk
          ? "Trūksta SMTP kintamųjų Vercel projekte (SMTP_HOST, SMTP_USER, SMTP_PASS). Po pridėjimo būtina Redeploy."
          : "Konfigūracija atrodo teisinga.",
  });
}
