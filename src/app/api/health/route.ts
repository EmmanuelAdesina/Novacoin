export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({ ok: true, message: "Sabi dey run! No DB needed." });
}
