import { randomBytes, timingSafeEqual } from "node:crypto";

const CSRF_TOKEN_LENGTH = 32;
const CSRF_HEADER = "x-csrf-token";

export function generateCsrfToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
}

export function validateCsrfToken(requestToken: string | null, sessionToken: string): boolean {
  if (!requestToken || requestToken.length !== sessionToken.length) {
    return false;
  }

  try {
    const a = Buffer.from(requestToken, "hex");
    const b = Buffer.from(sessionToken, "hex");
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function getCsrfTokenFromHeaders(headers: Headers): string | null {
  return headers.get(CSRF_HEADER);
}

export { CSRF_HEADER };
