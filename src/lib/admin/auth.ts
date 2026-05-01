const DEFAULT_ADMIN_COOKIE_NAME = "khuongbinh";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const SESSION_VERSION = "v1";
const OTP_STATE_VERSION = "otp-v1";
const OTP_TTL_SECONDS = 60 * 5;
const FIXED_SUPER_ADMIN_EMAIL = "gustavjung02@gmail.com";
const SUPER_ADMIN_PERMISSIONS = [
  "quotes:read",
  "quotes:write",
  "quotes:status",
  "quotes:send",
  "rfq:assign",
  "mail:send",
  "mail:read",
  "users:create",
  "users:disable",
  "users:manage",
] as const;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export type AdminRole = "owner" | "manager" | "staff" | "admin";
export type AdminAccountStatus = "active" | "disabled";
export type AdminPermission =
  | "quotes:read"
  | "quotes:write"
  | "quotes:status"
  | "quotes:send"
  | "rfq:assign"
  | "mail:send"
  | "mail:read"
  | "users:create"
  | "users:disable"
  | "users:manage";

export type AdminAccount = {
  email: string;
  role: AdminRole;
  permissions: AdminPermission[];
  passwords: string[];
};

export const ADMIN_PERMISSION_DEFINITIONS: Array<{ value: AdminPermission; label: string; description: string }> = [
  { value: "quotes:read", label: "Xem RFQ", description: "Xem danh sách yêu cầu và chi tiết từng RFQ." },
  { value: "quotes:write", label: "Soạn báo giá", description: "Cập nhật dữ liệu báo giá và ghi chú nội bộ." },
  { value: "quotes:status", label: "Đổi trạng thái", description: "Chuyển trạng thái RFQ hoặc báo giá." },
  { value: "quotes:send", label: "Xác nhận gửi báo giá", description: "Đánh dấu báo giá đã gửi và hoàn tất bước nội bộ." },
  { value: "rfq:assign", label: "Phân công RFQ", description: "Phụ trách điều phối RFQ cho nhân sự xử lý." },
  { value: "mail:send", label: "Gửi mail", description: "Gửi mail thủ công từ admin." },
  { value: "mail:read", label: "Đọc mail", description: "Dành sẵn cho inbox khi tích hợp đọc mail sau này." },
  { value: "users:create", label: "Tạo tài khoản", description: "Tạo tài khoản admin hoặc nhân viên mới." },
  { value: "users:disable", label: "Khóa tài khoản", description: "Khóa hoặc mở lại tài khoản cấp dưới." },
  { value: "users:manage", label: "Toàn quyền người dùng", description: "Quản trị toàn bộ tài khoản cấp dưới." },
];

export const ADMIN_ROLE_DEFINITIONS: Array<{ value: AdminRole; label: string; description: string }> = [
  { value: "owner", label: "Owner", description: "Toàn quyền hệ thống." },
  { value: "manager", label: "Quản lý", description: "Điều phối vận hành báo giá và hỗ trợ nội bộ." },
  { value: "admin", label: "Admin vận hành", description: "Phụ trách nghiệp vụ admin hằng ngày." },
  { value: "staff", label: "Nhân viên", description: "Xử lý RFQ và báo giá theo phân quyền được cấp." },
];

type AdminSessionPayload = {
  role: AdminRole;
  email: string;
  permissions: string[];
  version: typeof SESSION_VERSION;
  exp: number;
};

type AdminOtpStatePayload = {
  version: typeof OTP_STATE_VERSION;
  exp: number;
  email: string;
  role: AdminRole;
  permissions: string[];
  code: string;
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

function normalizeSecret(value: string) {
  return value.normalize("NFKC").trim();
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizeRole(value: string | undefined): AdminRole {
  const role = (value || "admin").trim().toLowerCase();
  if (role === "owner" || role === "manager" || role === "staff" || role === "admin") {
    return role;
  }
  return "admin";
}

function normalizePermissions(value: unknown) {
  if (Array.isArray(value)) {
    return Array.from(new Set(value.map((entry) => String(entry || "").trim()).filter(Boolean))) as AdminPermission[];
  }

  if (typeof value === "string") {
    return Array.from(new Set(value.split(/[\n,;|]/g).map((entry) => entry.trim()).filter(Boolean))) as AdminPermission[];
  }

  return [] as AdminPermission[];
}

export function getAdminPermissionLabel(permission: AdminPermission | string) {
  return ADMIN_PERMISSION_DEFINITIONS.find((item) => item.value === permission)?.label ?? permission;
}

export function getAdminRoleLabel(role: AdminRole | string) {
  return ADMIN_ROLE_DEFINITIONS.find((item) => item.value === role)?.label ?? role;
}

function buildCandidatePasswordVariants(candidate: string) {
  const normalized = normalizeSecret(candidate);
  const parts = normalized.split("/").map((part) => normalizeSecret(part)).filter(Boolean);
  const variants = [normalized, ...parts];
  return Array.from(new Set(variants.filter(Boolean)));
}

function getAllowedAdminSecrets() {
  const primary = getAdminSecret();
  const fallbackFromEnv = process.env.ADMIN_SECRET_FALLBACK?.trim() ?? "";
  const raw = [primary, fallbackFromEnv].filter(Boolean).join("\n");

  return Array.from(
    new Set(
      raw
        .split(/[\n,;|]/g)
        .map((entry) => normalizeSecret(entry))
        .filter(Boolean),
    ),
  );
}

function parseAdminUsersFromEnv() {
  const raw = process.env.ADMIN_USERS_JSON?.trim();
  if (!raw) return [] as AdminAccount[];

  try {
    const parsed = JSON.parse(raw) as Array<{
      email?: string;
      password?: string;
      passwords?: string[] | string;
      role?: string;
      permissions?: string[] | string;
    }>;

    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((entry) => {
        const email = normalizeEmail(String(entry.email || ""));
        const mergedPasswords = [
          ...(Array.isArray(entry.passwords) ? entry.passwords : [entry.passwords]),
          entry.password,
        ]
          .flat()
          .map((value) => normalizeSecret(String(value || "")))
          .filter(Boolean);

        if (!email || mergedPasswords.length === 0) {
          return null;
        }

        return {
          email,
          role: normalizeRole(entry.role),
          permissions: normalizePermissions(entry.permissions),
          passwords: Array.from(new Set(mergedPasswords)),
        } satisfies AdminAccount;
      })
      .filter((entry): entry is AdminAccount => Boolean(entry));
  } catch {
    return [];
  }
}

function getFixedSuperAdminAccount(configuredAccounts: AdminAccount[] = []): AdminAccount {
  const configuredOwner = configuredAccounts.find((account) => account.email === FIXED_SUPER_ADMIN_EMAIL);

  return {
    email: FIXED_SUPER_ADMIN_EMAIL,
    role: "owner",
    permissions: Array.from(SUPER_ADMIN_PERMISSIONS),
    passwords: Array.from(new Set([...(configuredOwner?.passwords ?? []), ...getAllowedAdminSecrets()])),
  };
}

export function getFixedSuperAdminEmail() {
  return FIXED_SUPER_ADMIN_EMAIL;
}

export function getSuperAdminPermissions() {
  return Array.from(SUPER_ADMIN_PERMISSIONS);
}

export function getAdminAccounts() {
  const configured = parseAdminUsersFromEnv();
  const managedAccounts = configured.filter((account) => account.email !== FIXED_SUPER_ADMIN_EMAIL);
  return [getFixedSuperAdminAccount(configured), ...managedAccounts];
}

export function getDefaultAdminLoginEmail() {
  return FIXED_SUPER_ADMIN_EMAIL;
}

export function getAdminAccountByCredentials(emailCandidate: string, passwordCandidate: string) {
  const email = normalizeEmail(emailCandidate);
  if (!email) return null;

  const passwordVariants = buildCandidatePasswordVariants(passwordCandidate);
  if (passwordVariants.length === 0) return null;

  const accounts = getAdminAccounts();
  const found = accounts.find((account) => {
    if (account.email !== email) return false;
    return passwordVariants.some((candidate) => account.passwords.includes(candidate));
  });

  return found || null;
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

export function getAdminOtpCookieName() {
  return `${getAdminCookieName()}_otp`;
}

export function getAdminOtpCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: OTP_TTL_SECONDS,
  };
}

export async function createAdminSessionToken(input?: { email?: string; role?: AdminRole; permissions?: string[] }) {
  const secret = getAdminSecret();
  if (!secret) {
    throw new Error("Missing ADMIN_SECRET environment variable.");
  }

  const defaultAccount = getFixedSuperAdminAccount();
  const payload: AdminSessionPayload = {
    role: input?.role ?? defaultAccount.role,
    email: normalizeEmail(input?.email || defaultAccount.email),
    permissions: normalizePermissions(input?.permissions),
    version: SESSION_VERSION,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };

  const payloadText = JSON.stringify(payload);
  const encodedPayload = toBase64Url(encoder.encode(payloadText));
  const signature = await signPayload(payloadText, secret);
  return `${encodedPayload}.${signature}`;
}

export async function verifyAdminSessionToken(token: string | undefined | null) {
  const payload = await getVerifiedAdminSession(token);
  return Boolean(payload);
}

export async function getVerifiedAdminSession(token: string | undefined | null) {
  if (!token) {
    return null;
  }

  const secret = getAdminSecret();
  if (!secret) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  try {
    const payloadText = decoder.decode(fromBase64Url(encodedPayload));
    const payload = JSON.parse(payloadText) as Partial<AdminSessionPayload>;
    if (
      typeof payload.role !== "string" ||
      typeof payload.email !== "string" ||
      !Array.isArray(payload.permissions) ||
      payload.version !== SESSION_VERSION ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    const key = await importSigningKey(secret);
    const isValid = await getCryptoOrThrow().subtle.verify("HMAC", key, fromBase64Url(signature), encoder.encode(payloadText));
    if (!isValid) {
      return null;
    }

    return {
      email: normalizeEmail(payload.email),
      role: normalizeRole(payload.role),
      permissions: normalizePermissions(payload.permissions),
    };
  } catch {
    return null;
  }
}

export async function createAdminOtpStateToken(input: { email: string; role: AdminRole; permissions?: string[]; code: string }) {
  const secret = getAdminSecret();
  if (!secret) {
    throw new Error("Missing ADMIN_SECRET environment variable.");
  }

  const payload: AdminOtpStatePayload = {
    version: OTP_STATE_VERSION,
    exp: Math.floor(Date.now() / 1000) + OTP_TTL_SECONDS,
    email: normalizeEmail(input.email),
    role: normalizeRole(input.role),
    permissions: normalizePermissions(input.permissions),
    code: String(input.code || "").trim(),
  };

  const payloadText = JSON.stringify(payload);
  const encodedPayload = toBase64Url(encoder.encode(payloadText));
  const signature = await signPayload(payloadText, secret);
  return `${encodedPayload}.${signature}`;
}

export async function verifyAdminOtpStateToken(token: string | undefined | null) {
  if (!token) {
    return null;
  }

  const secret = getAdminSecret();
  if (!secret) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  try {
    const payloadText = decoder.decode(fromBase64Url(encodedPayload));
    const payload = JSON.parse(payloadText) as Partial<AdminOtpStatePayload>;
    if (
      payload.version !== OTP_STATE_VERSION ||
      typeof payload.exp !== "number" ||
      typeof payload.email !== "string" ||
      typeof payload.code !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    const key = await importSigningKey(secret);
    const isValid = await getCryptoOrThrow().subtle.verify("HMAC", key, fromBase64Url(signature), encoder.encode(payloadText));
    if (!isValid) {
      return null;
    }

    return {
      email: normalizeEmail(payload.email),
      role: normalizeRole(payload.role),
      permissions: normalizePermissions(payload.permissions),
      code: String(payload.code).trim(),
    };
  } catch {
    return null;
  }
}

export function isConfiguredAdminSecret(candidate: string) {
  const candidateVariants = buildCandidatePasswordVariants(candidate);
  if (candidateVariants.length === 0) {
    return false;
  }

  const allowedSecrets = getAllowedAdminSecrets();
  return candidateVariants.some((entry) => allowedSecrets.includes(entry));
}

export function getAdminLoginRedirect(nextPath: string | null | undefined) {
  if (!nextPath || !nextPath.startsWith("/admin")) {
    return "/admin/bao-gia";
  }

  return nextPath;
}
