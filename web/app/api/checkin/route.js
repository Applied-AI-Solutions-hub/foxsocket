import { reasonAsDevice } from "../../../lib/device-chat";
import { getDevice } from "../../../lib/devices";
import { formatBrief, readBoard, updateBoard } from "../../../lib/board-store";

export const dynamic = "force-dynamic";

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
  const note = typeof body?.note === "string" ? body.note.trim() : "";
  const incoming = Array.isArray(body?.messages) ? body.messages : [];
  const localTrace = incoming
    .filter((item) => item?.from === device.id && typeof item.content === "string")
    .slice(-8)
    .map((item) => item.content.trim())
    .filter(Boolean)
    .join("\n");
  const board = await readBoard();
  const sparky = getDevice("host");

  try {
    const local = await reasonAsDevice(device, {
      maxTokens: 280,
      messages: [
        { role: "system", content: device.system },
        {
          role: "user",
          content: `Prepare a check-in for Sparky on HomePC. Summarize in 3 short bullets: (1) what you currently believe, (2) what you decided locally, (3) what you need from HomePC.\nDevice note: ${note || "(none)"}\nRecent local trace:\n${localTrace || "(none)"}\nCurrent brief you already have:\n${formatBrief(board)}`,
        },
      ],
    });

    const merged = await reasonAsDevice(sparky, {
      maxTokens: 360,
      messages: [
        { role: "system", content: sparky.system },
        {
          role: "user",
          content: `${device.agent} on ${device.device} is checking in.\nTheir local summary:\n${local.content}\nExisting HomePC context:\n${formatBrief(board)}\nReply with:\nBRIEF: 2-4 sentences of the latest household context they should work from.\nFACTS: up to 5 short factual bullets (plain text, no numbering).\nACK: one sentence to ${device.agent}.`,
        },
      ],
    });

    const facts = [...(board.facts || [])];
    for (const line of merged.content.split("\n")) {
      const bullet = line.replace(/^\s*(?:FACTS:|[-*•]|\d+\.)\s*/i, "").trim();
      if (line.match(/^\s*(?:[-*•]|\d+\.)\s+/) && bullet) facts.push(bullet);
    }

    const next = await updateBoard((current) => ({
      ...current,
      brief: merged.content,
      facts: facts.slice(-12),
      updatedAt: new Date().toISOString(),
      checkins: {
        ...current.checkins,
        [device.id]: {
          at: new Date().toISOString(),
          summary: local.content.slice(0, 280),
          agent: device.agent,
        },
      },
    }));

    return Response.json({
      from: device.id,
      agent: device.agent,
      localModel: local.model,
      sparkyModel: merged.model,
      localSummary: local.content,
      sparkyBrief: merged.content,
      board: next,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 502 });
  }
}
