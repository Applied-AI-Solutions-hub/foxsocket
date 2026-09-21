import { probeInference } from "../../../lib/inference";
import { getDevices } from "../../../lib/devices";
import { readBoard } from "../../../lib/board-store";
import { loadProviders, publicProviders } from "../../../lib/provider-store";
import { probeProvider } from "../../../lib/foxsocket-llm";

export const dynamic = "force-dynamic";

export async function GET() {
  const cfg = loadProviders();
  const [inference, hostProvider, board] = await Promise.all([
    probeInference(),
    probeProvider({
      providerId: cfg.active,
      apiKey: cfg.keys[cfg.active],
      model: cfg.models[cfg.active],
    }),
    readBoard(),
  ]);
  const available = inference.available || inference.models || [];
  const host = publicProviders();
  const devices = Object.values(getDevices()).map((device) => ({
    id: device.id,
    agent: device.agent,
    model: device.id === "host" ? host.model || device.model : device.model,
    present: device.id === "host" ? hostProvider.ok : available.includes(device.model) || available.length === 0,
  }));
  return Response.json({
    machine: "HomePC",
    harness: "foxsocket-web",
    port: 4317,
    inference,
    devices,
    board,
    hostProvider: {
      ...hostProvider,
      ...publicProviders(),
    },
  });
}
