const DEFAULT_URL = "http://127.0.0.1:11434/v1";
const DEFAULT_MODEL = "qwen3.5:9b";

export function inferenceConfig() {
  const baseUrl = (process.env.FOXSOCKET_OPENAI_COMPAT_URL || DEFAULT_URL).replace(/\/$/, "");
  const model = process.env.FOXSOCKET_MODEL || DEFAULT_MODEL;
  const apiKey = process.env.FOXSOCKET_OPENAI_API_KEY || "local";
  return { baseUrl, model, apiKey };
}

function originFromCompat(baseUrl) {
  return baseUrl.replace(/\/v1$/i, "");
}

function isOllama(baseUrl) {
  return process.env.FOXSOCKET_INFERENCE === "ollama" || /:11434\b/.test(baseUrl);
}

function stripThink(text) {
  return String(text || "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<\/?think>/gi, "")
    .trim();
}

function pickText(message) {
  const content = stripThink(message?.content);
  if (content) return content;
  return stripThink(message?.reasoning);
}

let inferenceQueue = Promise.resolve();

function enqueue(work) {
  const run = inferenceQueue.then(work, work);
  inferenceQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function chatCompletions({ messages, maxTokens = 512, model: modelOverride } = {}) {
  const { baseUrl, model: defaultModel, apiKey } = inferenceConfig();
  const model = modelOverride || defaultModel;
  return enqueue(async () => {
  if (isOllama(baseUrl)) {
    const response = await fetch(`${originFromCompat(baseUrl)}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        think: false,
        options: { num_predict: maxTokens, temperature: 0.4 },
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload?.error || `Ollama ${response.status}`);
    }
    const content = pickText(payload?.message);
    if (!content) throw new Error(`${model} returned an empty reply`);
    return { content, model: payload.model || model, baseUrl };
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      temperature: 0.4,
      max_tokens: maxTokens,
    }),
  });
  const text = await response.text();
  let payload = null;
  try {
    payload = JSON.parse(text);
  } catch {
    payload = { raw: text };
  }
  if (!response.ok) {
    const detail = payload?.error?.message || payload?.raw || text.slice(0, 400);
    throw new Error(`Inference ${response.status}: ${detail}`);
  }
  const content = pickText(payload?.choices?.[0]?.message);
  if (!content) throw new Error(`${model} returned an empty reply`);
  return { content, model: payload.model || model, baseUrl };
  });
}

export async function probeInference() {
  const { baseUrl, model, apiKey } = inferenceConfig();
  const started = Date.now();
  const modelsUrl = isOllama(baseUrl)
    ? `${originFromCompat(baseUrl)}/api/tags`
    : `${baseUrl}/models`;
  try {
    const response = await fetch(modelsUrl, {
      headers: isOllama(baseUrl) ? {} : { authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
    const ok = response.ok;
    let models = [];
    if (ok) {
      const body = await response.json();
      if (Array.isArray(body.models)) {
        models = body.models.map((item) => item.name).filter(Boolean);
      } else {
        models = (body.data || []).map((item) => item.id).filter(Boolean);
      }
    }
    return {
      ok,
      status: response.status,
      ms: Date.now() - started,
      baseUrl,
      model,
      backend: isOllama(baseUrl) ? "ollama" : "openai-compat",
      models: models.slice(0, 12),
      modelPresent: models.includes(model) || models.length === 0,
      available: models,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      ms: Date.now() - started,
      baseUrl,
      model,
      models: [],
      error: error.message,
    };
  }
}
