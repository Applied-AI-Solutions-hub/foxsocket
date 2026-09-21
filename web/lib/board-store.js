import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const filePath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "data", "board-context.json");

function emptyBoard() {
  return {
    brief: "No check-ins yet. Kit, Nox, and Sparky each reason on their own model until someone syncs with HomePC.",
    facts: [],
    checkins: {},
    updatedAt: null,
  };
}

let writeChain = Promise.resolve();

async function readFileBoard() {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return emptyBoard();
  }
}

export async function readBoard() {
  return readFileBoard();
}

export async function updateBoard(mutator) {
  const run = writeChain.then(async () => {
    const current = await readFileBoard();
    const next = await mutator(structuredClone(current));
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(next, null, 2));
    return structuredClone(next);
  });
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function formatBrief(board) {
  const facts = (board.facts || []).slice(-8).map((fact, index) => `${index + 1}. ${fact}`).join("\n");
  const checkins = Object.entries(board.checkins || {})
    .map(([id, entry]) => `- ${id}: ${entry.summary} (${entry.at || "unknown"})`)
    .join("\n");
  return [
    "SHARED CONTEXT FROM SPARKY / HOMEPC",
    board.brief || "",
    facts ? `Facts:\n${facts}` : "Facts: none yet",
    checkins ? `Last check-ins:\n${checkins}` : "Last check-ins: none",
  ].join("\n");
}
