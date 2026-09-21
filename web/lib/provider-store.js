import fs from "node:fs";
import path from "node:path";
import { maskKey, listProviders, getProvider } from "./foxsocket-llm";

const FILE = path.join(process.cwd(), "data", "providers.json");

function emptyConfig() {
  return {
    active: "local",
    keys: { openai: "", anthropic: "", xai: "" },
    models: { openai: "", anthropic: "", xai: "", local: "" },
  };
}

export function loadProviders() {
  try {
    const parsed = JSON.parse(fs.readFileSync(FILE, "utf8"));
    const base = emptyConfig();
    return {
      active: ["openai", "anthropic", "xai", "local"].includes(parsed.active) ? parsed.active : "local",
      keys: { ...base.keys, ...(parsed.keys || {}) },
      models: { ...base.models, ...(parsed.models || {}) },
    };
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    return emptyConfig();
  }
}

export function saveProviders(patch) {
  const current = loadProviders();
  const next = {
    active: patch.active || current.active,
    keys: { ...current.keys },
    models: { ...current.models },
  };
  for (const id of ["openai", "anthropic", "xai"]) {
    if (typeof patch.keys?.[id] === "string" && patch.keys[id].trim()) {
      next.keys[id] = patch.keys[id].trim();
    }
  }
  if (patch.models && typeof patch.models === "object") {
    for (const [id, value] of Object.entries(patch.models)) {
      if (typeof value === "string") next.models[id] = value.trim();
    }
  }
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(`${FILE}.tmp`, JSON.stringify(next, null, 2));
  fs.renameSync(`${FILE}.tmp`, FILE);
  return publicProviders();
}

export function publicProviders() {
  const cfg = loadProviders();
  const provider = getProvider(cfg.active);
  return {
    active: cfg.active,
    model: cfg.models[cfg.active] || provider?.defaultModel || "",
    catalog: listProviders().map((item) => ({
      ...item,
      model: cfg.models[item.id] || item.defaultModel,
      hasKey: Boolean(cfg.keys[item.id]),
      masked: maskKey(cfg.keys[item.id]),
    })),
  };
}
