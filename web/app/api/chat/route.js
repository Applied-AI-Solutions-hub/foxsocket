import { reasonAsDevice } from "../../../lib/device-chat";
import { getDevice } from "../../../lib/devices";
import { formatBrief, readBoard } from "../../../lib/board-store";

export const dynamic = "force-dynamic";

function transcript(incoming, speaker) {
  return incoming
    .filter((item) => item && typeof item.content === "string" && item.content.trim())
    .slice(-16)
    .map((item) => {
      const who = item.from || "unknown";
      const mine = who === speaker && item.role === "assistant";
      return {
        role: mine || item.role === "assistant" && who === speaker ? "assistant" : "user",
        content: `[${who}${item.kind === "checkin" ? " check-in" : ""}] ${item.content.trim()}`,
      };
    });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const device = getDevice(body?.from);
  if (!device) {
    return Response.json({ error: "Unknown device" }, { status: 400 });
  }
  const incoming = Array.isArray(body?.messages) ? body.messages : [];
  const messages = transcript(incoming, device.id);
  if (!messages.length) {
    return Response.json({ error: "Send something for this device to reason about" }, { status: 400 });
  }
  const board = await readBoard();
  try {
    const result = await reasonAsDevice(device, {
      messages: [
        { role: "system", content: device.system },
        {
          role: "system",
          content: `${formatBrief(board)}\nUse this HomePC brief if it is current. If it is empty or stale, say so and reason locally.`,
        },
        ...messages,
      ],
    });
    return Response.json({
      role: "assistant",
      from: device.id,
      agent: device.agent,
      content: result.content,
      model: result.model,
      provider: result.providerId,
      kind: "local",
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 502 });
  }
}
