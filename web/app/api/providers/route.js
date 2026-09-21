import { publicProviders, saveProviders, loadProviders } from "../../../lib/provider-store";
import { probeProvider } from "../../../lib/foxsocket-llm";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json(publicProviders());
}

export async function PUT(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  try {
    return Response.json(saveProviders(body || {}));
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const cfg = loadProviders();
  const providerId = body.providerId || cfg.active;
  const result = await probeProvider({
    providerId,
    apiKey: cfg.keys[providerId],
    model: cfg.models[providerId],
  });
  return Response.json(result, { status: result.ok ? 200 : 502 });
}
