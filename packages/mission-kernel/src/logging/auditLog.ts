import { mkdir, appendFile, readFile } from "node:fs/promises";
import { dirname } from "node:path";
import { createHash, randomUUID } from "node:crypto";
import type { AuditEvent } from "../types/audit.js";

export function createCorrelationId(): string {
  return randomUUID();
}

export function parametersHash(value: unknown): string {
  const json = JSON.stringify(value ?? null);
  return createHash("sha256").update(json).digest("hex");
}

export async function appendAuditEvent(path: string, event: AuditEvent): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const line = JSON.stringify(event) + "\n";
  await appendFile(path, line, { encoding: "utf8" });
}

export async function readAuditLog(path: string): Promise<AuditEvent[]> {
  const content = await readFile(path, "utf8").catch((err: NodeJS.ErrnoException) => {
    if (err.code === "ENOENT") return "";
    throw err;
  });

  return content
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as AuditEvent);
}

export function createAuditEvent(params: Omit<AuditEvent, "timestamp" | "script_name" | "version">): AuditEvent {
  return {
    timestamp: new Date().toISOString(),
    script_name: "agentos",
    version: "0.1.0",
    ...params,
  };
}
