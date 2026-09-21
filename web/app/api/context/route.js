import { readBoard } from "../../../lib/board-store";
import { getDevices } from "../../../lib/devices";

export const dynamic = "force-dynamic";

export async function GET() {
  const board = await readBoard();
  const devices = Object.values(getDevices()).map(({ id, agent, device, model, place }) => ({
    id,
    agent,
    device,
    model,
    place,
  }));
  return Response.json({ board, devices });
}
