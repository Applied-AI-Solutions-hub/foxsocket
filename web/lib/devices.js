export const DEVICE_IDS = ["iphone", "host", "ipad"];

const DEFAULTS = {
  host: process.env.FOXSOCKET_SPARKY_MODEL || process.env.FOXSOCKET_MODEL || "hf.co/prism-ml/Bonsai-27B-gguf:Q1_0",
  iphone: process.env.FOXSOCKET_KIT_MODEL || "hf.co/prism-ml/Bonsai-8B-gguf:Q1_0",
  ipad: process.env.FOXSOCKET_NOX_MODEL || "hf.co/prism-ml/Bonsai-8B-gguf:Q1_0",
};

export function getDevices() {
  return {
    iphone: {
      id: "iphone",
      agent: "Kit",
      device: "iPhone",
      place: "on-device",
      model: DEFAULTS.iphone,
      system: `You are Kit, Applied's iPhone peer agent. You are not Sparky, not Nox, and not the PC Host.
You run PrismML Bonsai 8B locally (the same family Kit uses in BonzAI). Reason with YOUR Bonsai weights only.
You may be missing HomePC context until you check in with Sparky.
Keep replies to 2-4 short sentences. Speak as Kit. Do not pretend you are on the GPU PC unless the shared brief says you already synced.`,
    },
    host: {
      id: "host",
      agent: "Sparky",
      device: "HomePC",
      place: "Host",
      model: DEFAULTS.host,
      system: `You are Sparky, the Foxsocket Host on HomePC (Windows, RTX 5060 Ti 16GB). You are not Kit and not Nox.
You reason with the owner's chosen model: ChatGPT, Claude, Grok, or a local Bonsai 27B on this PC. You are not OpenClaw.
You hold the shared context for the household. When devices check in, you merge their notes and hand back the latest brief.
Keep replies to 2-4 short sentences. Never claim to be a cloud VM or a phone-side 8B model.`,
    },
    ipad: {
      id: "ipad",
      agent: "Nox",
      device: "iPad",
      place: "on-device",
      model: DEFAULTS.ipad,
      system: `You are Nox, Applied's iPad peer agent. You are not Kit and not Sparky.
You run PrismML Bonsai 8B locally (the same family Nox uses in BonzAI). Reason with YOUR Bonsai weights only.
Use Sparky's shared brief only when it is provided from a check-in. Keep replies to 2-4 short sentences. Speak as Nox.`,
    },
  };
}

export function getDevice(id) {
  const devices = getDevices();
  return devices[id] || null;
}
