import { getSupabase } from "@/lib/supabase";

export async function PATCH(request, { params }) {
  const supabase = getSupabase();
  const body = await request.json();
  const allowed = [
    "email",
    "name",
    "invoice_number",
    "due_date",
    "paid",
    "needs_reminder",
  ];
  const updates = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  const { data, error } = await supabase
    .from("clients")
    .update(updates)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ client: data });
}

export async function DELETE(request, { params }) {
  const supabase = getSupabase();
  const { error } = await supabase.from("clients").delete().eq("id", params.id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ ok: true });
}
