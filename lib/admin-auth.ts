import { createHmac } from "crypto";

/** Creates a deterministic admin token from ADMIN_EMAIL + ADMIN_PASSWORD env vars. */
export function createAdminToken(): string {
  const email = process.env.ADMIN_EMAIL ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";
  if (!email || !password) return "";
  return createHmac("sha256", password).update(email).digest("hex");
}

/** Validates an admin token cookie value. */
export function isValidAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  const expected = createAdminToken();
  if (!expected) return false;
  return token === expected;
}
