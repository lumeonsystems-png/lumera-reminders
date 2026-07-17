import { getSupabase } from "@/lib/supabase";
import { getTransporter, buildReminderEmail } from "@/lib/mailer";

export async function POST(request) {
  const { ids } = await request.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return Response.json({ error: "Nepažymėtas joks el. paštas" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data: clients, error } = await supabase
    .from("clients")
    .select("*")
    .in("id", ids);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  let transporter;
  try {
    transporter = getTransporter();
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }

  const results = [];

  for (const client of clients) {
    const { subject, body } = buildReminderEmail(client);
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: client.email,
        subject,
        text: body,
      });

      await supabase
        .from("clients")
        .update({ last_reminder_sent_at: new Date().toISOString() })
        .eq("id", client.id);

      results.push({ email: client.email, ok: true });
    } catch (err) {
      results.push({ email: client.email, ok: false, error: err.message });
    }
  }

  return Response.json({ results });
}
