import { checkPassword, authCookie } from "@/lib/auth";

export async function POST(request) {
  const { password } = await request.json();

  if (!checkPassword(password)) {
    return Response.json({ error: "Neteisingas slaptažodis" }, { status: 401 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": authCookie(),
    },
  });
}
