"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DEVICES = [
  { id: "iphone", label: "Kit · iPhone", hint: "On-device model" },
  { id: "host", label: "Sparky · HomePC", hint: "Host model + context" },
  { id: "ipad", label: "Nox · iPad", hint: "On-device model" },
];

function nowStamp() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function BoardPage() {
  const [health, setHealth] = useState(null);
  const [providers, setProviders] = useState(null);
  const [messages, setMessages] = useState([]);
  const [drafts, setDrafts] = useState({ iphone: "", host: "", ipad: "" });
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");
  const boardRef = useRef(null);

  const refreshHealth = useCallback(async () => {
    try {
      const [healthResponse, providerResponse] = await Promise.all([
        fetch("/api/health", { cache: "no-store" }),
        fetch("/api/providers", { cache: "no-store" }),
      ]);
      setHealth(await healthResponse.json());
      setProviders(await providerResponse.json());
    } catch (err) {
      setHealth({ error: err.message });
    }
  }, []);

  useEffect(() => {
    refreshHealth();
    const id = setInterval(refreshHealth, 8000);
    return () => clearInterval(id);
  }, [refreshHealth]);

  useEffect(() => {
    boardRef.current?.scrollTo({ top: boardRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const deviceMeta = useMemo(() => {
    const map = {};
    for (const item of health?.devices || []) map[item.id] = item;
    return map;
  }, [health]);

  const payloadMessages = (list) =>
    list.map(({ from, role, content, kind }) => ({ from, role, content, kind }));

  const send = async (from) => {
    const text = drafts[from].trim();
    if (!text || busy) return;
    const userMessage = { id: crypto.randomUUID(), from, role: "user", content: text, at: nowStamp(), kind: "local" };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setDrafts((current) => ({ ...current, [from]: "" }));
    setBusy(from);
    setError("");
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ from, messages: payloadMessages(nextMessages) }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Local model failed");
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          from: payload.from,
          role: "assistant",
          content: payload.content,
          model: payload.model,
          agent: payload.agent,
          kind: "local",
          at: nowStamp(),
        },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
      refreshHealth();
    }
  };

  const checkIn = async (from) => {
    if (busy) return;
    setBusy(from);
    setError("");
    try {
      const response = await fetch("/api/checkin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          from,
          note: drafts[from].trim(),
          messages: payloadMessages(messages),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Check-in failed");
      setDrafts((current) => ({ ...current, [from]: "" }));
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          from,
          role: "assistant",
          kind: "checkin",
          agent: payload.agent,
          model: payload.localModel,
          content: `${payload.agent} checked in with Sparky.\n${payload.localSummary}`,
          at: nowStamp(),
        },
        {
          id: crypto.randomUUID(),
          from: "host",
          role: "assistant",
          kind: "brief",
          agent: "Sparky",
          model: payload.sparkyModel,
          content: payload.sparkyBrief,
          at: nowStamp(),
        },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(null);
      refreshHealth();
    }
  };

  const status = useMemo(() => {
    if (!health) return "Checking local models…";
    if (health.error) return health.error;
    const roster = (health.devices || [])
      .map((item) => `${item.agent}:${item.model}${item.present ? "" : " (missing)"}`)
      .join(" · ");
    return roster || "No device roster";
  }, [health]);

  return (
    <div className="min-h-screen bg-[#0A0F1A] text-slate-100">
      <header className="border-b border-cyan-400/20 px-6 py-4 flex flex-wrap items-center gap-4 justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-300/80">Foxsocket · peer circuit</p>
          <h1 className="text-xl font-semibold tracking-tight">Each device thinks locally, then checks in with Sparky</h1>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <Pill ok={health?.inference?.ok} label={health?.inference?.ok ? "Ollama up" : "No local models"} />
          <Pill
            ok={health?.hostProvider?.ok}
            label={
              health?.hostProvider?.ok
                ? `Sparky · ${providers?.catalog?.find((item) => item.id === providers.active)?.label || providers?.active || "Host"}`
                : "Sparky model not ready"
            }
          />
          <Pill ok label="Harness :4317" />
        </div>
      </header>

      <p className="px-6 pt-3 text-sm text-slate-400 font-mono">{status}</p>
      {health?.board?.brief ? (
        <p className="px-6 pt-2 text-sm text-cyan-100/80 line-clamp-3">
          HomePC brief: {health.board.brief}
        </p>
      ) : null}
      {error ? <p className="px-6 pt-2 text-sm text-amber-300">{error}</p> : null}
      <HostModels providers={providers} onSaved={refreshHealth} onError={setError} />

      <main className="grid gap-4 p-4 xl:grid-cols-[minmax(240px,1fr)_minmax(320px,1.4fr)_minmax(240px,1fr)]">
        {DEVICES.map((device) => (
          <DeviceColumn
            key={device.id}
            device={device}
            meta={deviceMeta[device.id]}
            draft={drafts[device.id]}
            busy={busy}
            onChange={(value) => setDrafts((current) => ({ ...current, [device.id]: value }))}
            onSend={() => send(device.id)}
            onCheckIn={() => checkIn(device.id)}
            messages={messages}
            boardRef={device.id === "host" ? boardRef : null}
          />
        ))}
      </main>
    </div>
  );
}

function HostModels({ providers, onSaved, onError }) {
  const [active, setActive] = useState("local");
  const [model, setModel] = useState("");
  const [keys, setKeys] = useState({ openai: "", anthropic: "", xai: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!providers) return;
    setActive(providers.active || "local");
    setModel(providers.model || "");
  }, [providers]);

  const save = async () => {
    setSaving(true);
    onError("");
    try {
      const response = await fetch("/api/providers", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ active, keys, models: { [active]: model } }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not save models");
      const test = await fetch("/api/providers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ providerId: active }),
      });
      const probe = await test.json();
      if (!test.ok) throw new Error(probe.error || "Could not reach that model");
      await onSaved();
    } catch (error) {
      onError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!providers) return null;
  return (
    <section className="mx-6 mt-3 rounded-xl border border-cyan-400/20 bg-[#0F172A] p-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs text-slate-400">
          Sparky uses
          <select
            value={active}
            onChange={(event) => setActive(event.target.value)}
            className="mt-1 block rounded-lg bg-black/40 border border-white/10 px-2 py-1 text-sm text-slate-100"
          >
            {(providers.catalog || []).map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-slate-400">
          Model id
          <input
            value={model}
            onChange={(event) => setModel(event.target.value)}
            placeholder="default"
            className="mt-1 block min-w-[220px] rounded-lg bg-black/40 border border-white/10 px-2 py-1 text-sm text-slate-100"
          />
        </label>
        {(providers.catalog || [])
          .filter((item) => item.needsKey)
          .map((item) => (
            <label key={item.id} className="text-xs text-slate-400">
              {item.label} key {item.hasKey ? `(${item.masked})` : ""}
              <input
                type="password"
                autoComplete="off"
                value={keys[item.id] || ""}
                placeholder={item.hasKey ? "leave blank to keep" : item.keyHint}
                onChange={(event) => setKeys((current) => ({ ...current, [item.id]: event.target.value }))}
                className="mt-1 block min-w-[180px] rounded-lg bg-black/40 border border-white/10 px-2 py-1 text-sm text-slate-100"
              />
            </label>
          ))}
        <button
          type="button"
          disabled={saving}
          onClick={save}
          className="rounded-lg bg-[#0084FF] px-3 py-2 text-sm font-medium disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save Sparky model"}
        </button>
      </div>
      <p className="mt-2 text-[11px] text-slate-500">
        Kit and Nox stay on local Bonsai. Sparky can use your paid ChatGPT, Claude, or Grok key, or a local model on this PC. Keys stay in web/data.
      </p>
    </section>
  );
}

function Pill({ ok, label }) {
  return (
    <span
      className={`rounded-full border px-3 py-1 ${
        ok ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200" : "border-amber-400/40 bg-amber-400/10 text-amber-200"
      }`}
    >
      {label}
    </span>
  );
}

function DeviceColumn({ device, meta, draft, busy, onChange, onSend, onCheckIn, messages, boardRef }) {
  const frame =
    device.id === "iphone"
      ? "rounded-[2rem] border-[6px] border-slate-700 max-w-[360px] mx-auto"
      : device.id === "ipad"
        ? "rounded-[1.6rem] border-[8px] border-slate-600"
        : "rounded-2xl border border-cyan-400/30";
  const locked = Boolean(busy);
  const mineBusy = busy === device.id;

  return (
    <section className={`${frame} bg-[#0F172A] min-h-[70vh] flex flex-col overflow-hidden ${device.id === "host" ? "shadow-[0_0_40px_rgba(0,229,246,0.12)]" : ""}`}>
      <div className="px-4 py-3 border-b border-white/10 flex items-baseline justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">{device.label}</h2>
          <p className="text-[11px] text-slate-400 font-mono">{meta?.model || device.hint}</p>
        </div>
        <span className="text-[11px] text-cyan-300">{device.id === "host" ? "context hub" : "local reasoner"}</span>
      </div>
      <div ref={boardRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-500">
            Think here with this device’s own model. Check in with Sparky to publish context to HomePC and pull the latest brief.
          </p>
        ) : (
          messages.map((item) => (
            <article
              key={item.id}
              className={`rounded-xl px-3 py-2 text-sm leading-relaxed ${
                item.kind === "brief"
                  ? "bg-cyan-400/15 border border-cyan-300/40"
                  : item.kind === "checkin"
                    ? "bg-amber-400/10 border border-amber-400/30"
                    : item.from === "host"
                      ? "bg-cyan-400/10 border border-cyan-400/20"
                      : item.from === "iphone"
                        ? "bg-sky-500/10 border border-sky-500/20"
                        : "bg-violet-500/10 border border-violet-500/20"
              }`}
            >
              <div className="flex justify-between text-[10px] uppercase tracking-wide text-slate-400 mb-1 gap-2">
                <span>
                  {item.agent || item.from}
                  {item.kind && item.kind !== "local" ? ` · ${item.kind}` : ""}
                  {item.model ? ` · ${item.model}` : ""}
                </span>
                <span>{item.at}</span>
              </div>
              <p className="whitespace-pre-wrap">{item.content}</p>
            </article>
          ))
        )}
        {mineBusy ? <p className="text-xs text-cyan-300 animate-pulse">{device.label.split(" · ")[0]} is using its local model…</p> : null}
      </div>
      <form
        className="p-3 border-t border-white/10 space-y-2"
        onSubmit={(event) => {
          event.preventDefault();
          onSend();
        }}
      >
        <input
          value={draft}
          onChange={(event) => onChange(event.target.value)}
          placeholder={device.id === "host" ? "Reason as Sparky…" : "Reason on this device…"}
          className="w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm outline-none focus:border-cyan-400/60"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={locked || !draft.trim()}
            className="flex-1 rounded-lg bg-[#0084FF] px-3 py-2 text-sm font-medium disabled:opacity-40"
          >
            Think locally
          </button>
          <button
            type="button"
            disabled={locked}
            onClick={onCheckIn}
            className="rounded-lg border border-cyan-400/40 px-3 py-2 text-sm text-cyan-100 disabled:opacity-40"
          >
            Check in
          </button>
        </div>
      </form>
    </section>
  );
}
