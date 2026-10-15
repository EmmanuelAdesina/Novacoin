export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ ok: true, message: "Sabi is running. No database is needed." });
}
