import path from "node:path";
import { createRequire } from "node:module";
import { chatCompletions } from "./inference";
import { completeChat } from "./foxsocket-llm";
import { loadProviders } from "./provider-store";

const require = createRequire(import.meta.url);
const agentFiles = require("../../foxsocket-agent.cjs");

function agentRoot() {
  return path.join(process.cwd(), "data");
}

export async function reasonAsDevice(device, { messages, maxTokens = 512 } = {}) {
  if (device.id !== "host") {
    return chatCompletions({ messages, maxTokens, model: device.model });
  }
  const root = agentRoot();
  agentFiles.ensure(root);
  const cfg = loadProviders();
  const lastUser = [...messages].reverse().find((item) => item.role === "user")?.content || "";
  const packed = [
    { role: "system", content: agentFiles.systemPrompt(root) },
    ...messages.filter((item) => item.role !== "system" || !String(item.content).includes("You are Sparky")),
  ];
  const result = await completeChat({
    providerId: cfg.active,
    model: cfg.models[cfg.active] || undefined,
    apiKey: cfg.keys[cfg.active],
    messages: packed,
    maxTokens,
  });
  const absorbed = agentFiles.absorbReply(root, result.content, {
    summary: `${String(lastUser).slice(0, 120)} → ${String(result.content).slice(0, 200)}`,
  });
  return { ...result, content: absorbed.visible };
}
