import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const llm = require("../../foxsocket-llm.cjs");

export const listProviders = llm.listProviders;
export const getProvider = llm.getProvider;
export const maskKey = llm.maskKey;
export const completeChat = llm.completeChat;
export const probeProvider = llm.probeProvider;
