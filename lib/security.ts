import { createHash } from "crypto";

export function buildIngestSignature(rawBody: string, secret: string) {
  return createHash("sha256").update(rawBody + secret).digest("hex");
}

export function safeCsvCell(value: unknown) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

