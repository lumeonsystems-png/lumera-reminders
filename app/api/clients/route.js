import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ clients: data });
}

export async function POST(request) {
  const supabase = getSupabase();
  const body = await request.json();

  const { email, name, invoice_number, due_date } = body;

  if (!email) {
    return Response.json({ error: "Trūksta el. pašto adreso" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("clients")
    .insert([
      {
        email,
        name: name || null,
        invoice_number: invoice_number || "26000-01",
        due_date: due_date || null,
      },
    ])
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ client: data });
}
