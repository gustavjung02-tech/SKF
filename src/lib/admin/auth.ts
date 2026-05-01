const DEFAULT_ADMIN_COOKIE_NAME = "khuongbinh";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const SESSION_VERSION = "v1";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

type AdminSessionPayload = {
  role: "admin";
  version: typeof SESSION_VERSION;
  exp: number;
};

function encodeBase64(value: Uint8Array) {
  if (typeof btoa === "function") {
    let binary = "";
    value.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  }

  return Buffer.from(value).toString("base64");
}

function decodeBase64(value: string) {
  if (typeof atob === "function") {
    const binary = atob(value);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  }

  return new Uint8Array(Buffer.from(value, "base64"));
}

function toBase64Url(value: Uint8Array) {
  return encodeBase64(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return decodeBase64(padded);
}

function getCryptoOrThrow() {
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.subtle) {
    throw new Error("Web Crypto is not available in the current runtime.");
  }
  return cryptoApi;
}

function getAdminSecret() {
  return process.env.ADMIN_SECRET?.trim() ?? "";
}

async function importSigningKey(secret: string) {
  return getCryptoOrThrow().subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function signPayload(payloadText: string, secret: string) {
  const key = await importSigningKey(secret);
  const signature = await getCryptoOrThrow().subtle.sign("HMAC", key, encoder.encode(payloadText));
  return toBase64Url(new Uint8Array(signature));
}

export function getAdminCookieName() {
  return process.env.ADMIN_COOKIE_NAME?.trim() || DEFAULT_ADMIN_COOKIE_NAME;
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

export async function createAdminSessionToken() {
  const secret = getAdminSecret();
  if (!secret) {
    throw new Error("Missing ADMIN_SECRET environment variable.");
  }

  const payload: AdminSessionPayload = {
    role: "admin",
    version: SESSION_VERSION,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };

  const payloadText = JSON.stringify(payload);
  const encodedPayload = toBase64Url(encoder.encode(payloadText));
  const signature = await signPayload(payloadText, secret);
  return `${encodedPayload}.${signature}`;
}

export async function verifyAdminSessionToken(token: string | undefined | null) {
  if (!token) {
    return false;
  }

  const secret = getAdminSecret();
  if (!secret) {
    return false;
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return false;
  }

  try {
    const payloadText = decoder.decode(fromBase64Url(encodedPayload));
    const payload = JSON.parse(payloadText) as Partial<AdminSessionPayload>;
    if (payload.role !== "admin" || payload.version !== SESSION_VERSION || typeof payload.exp !== "number") {
      return false;
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return false;
    }

    const key = await importSigningKey(secret);
    return getCryptoOrThrow().subtle.verify("HMAC", key, fromBase64Url(signature), encoder.encode(payloadText));
  } catch {
    return false;
  }
}

export function isConfiguredAdminSecret(candidate: string) {
  const secret = getAdminSecret();
  return Boolean(secret) && candidate === secret;
}

export function getAdminLoginRedirect(nextPath: string | null | undefined) {
  if (!nextPath || !nextPath.startsWith("/admin")) {
    return "/admin/bao-gia";
  }

  return nextPath;
}