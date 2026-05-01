import { get, put } from "@vercel/blob";
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  type AdminAccount,
  type AdminAccountStatus,
  type AdminPermission,
  type AdminRole,
  getAdminAccounts,
  getFixedSuperAdminEmail,
} from "@/lib/admin/auth";

export type ManagedAdminAccountRecord = {
  id: string;
  displayName: string;
  email: string;
  role: Exclude<AdminRole, "owner">;
  permissions: AdminPermission[];
  passwords: string[];
  status: AdminAccountStatus;
  createdAt: string;
  updatedAt: string;
};

type AdminUsersFileShape = {
  users: ManagedAdminAccountRecord[];
};

const ADMIN_USERS_FILE_PATH = path.join(process.cwd(), "data", "admin", "admin-users.json");
const ADMIN_USERS_BLOB_PATH = "admin/admin-users.json";

export function getManagedAdminStorageMode() {
  return process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "file";
}

function normalizeEmail(value: string) {
  return String(value || "").trim().toLowerCase();
}

function normalizeSecret(value: string) {
  return String(value || "").normalize("NFKC").trim();
}

function buildCandidatePasswordVariants(candidate: string) {
  const normalized = normalizeSecret(candidate);
  const parts = normalized.split("/").map((part) => normalizeSecret(part)).filter(Boolean);
  return Array.from(new Set([normalized, ...parts].filter(Boolean)));
}

async function ensureAdminUsersFile() {
  try {
    await fs.access(ADMIN_USERS_FILE_PATH);
  } catch {
    await fs.mkdir(path.dirname(ADMIN_USERS_FILE_PATH), { recursive: true });
    await fs.writeFile(ADMIN_USERS_FILE_PATH, JSON.stringify({ users: [] }, null, 2), "utf8");
  }
}

async function readAdminUsersFile(): Promise<AdminUsersFileShape> {
  await ensureAdminUsersFile();
  const raw = await fs.readFile(ADMIN_USERS_FILE_PATH, "utf8");

  try {
    const parsed = JSON.parse(raw) as Partial<AdminUsersFileShape>;
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
    };
  } catch {
    return { users: [] };
  }
}

async function writeAdminUsersFile(data: AdminUsersFileShape) {
  await fs.writeFile(ADMIN_USERS_FILE_PATH, JSON.stringify(data, null, 2), "utf8");
}

async function readAdminUsersBlob(): Promise<AdminUsersFileShape> {
  const result = await get(ADMIN_USERS_BLOB_PATH, {
    access: "private",
    useCache: false,
  });

  if (!result?.stream) {
    return { users: [] };
  }

  const raw = await new Response(result.stream).text();

  try {
    const parsed = JSON.parse(raw) as Partial<AdminUsersFileShape>;
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
    };
  } catch {
    return { users: [] };
  }
}

async function writeAdminUsersBlob(data: AdminUsersFileShape) {
  await put(ADMIN_USERS_BLOB_PATH, JSON.stringify(data, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json; charset=utf-8",
  });
}

async function readAdminUsersStore(): Promise<AdminUsersFileShape> {
  if (getManagedAdminStorageMode() === "blob") {
    return readAdminUsersBlob();
  }

  return readAdminUsersFile();
}

async function writeAdminUsersStore(data: AdminUsersFileShape) {
  if (getManagedAdminStorageMode() === "blob") {
    await writeAdminUsersBlob(data);
    return;
  }

  await writeAdminUsersFile(data);
}

function sanitizeManagedRecord(record: ManagedAdminAccountRecord): ManagedAdminAccountRecord {
  const role = record.role === "manager" || record.role === "admin" || record.role === "staff" ? record.role : "staff";
  const status = record.status === "disabled" ? "disabled" : "active";

  return {
    id: String(record.id || "").trim(),
    displayName: String(record.displayName || "").trim(),
    email: normalizeEmail(record.email),
    role,
    permissions: Array.from(new Set((Array.isArray(record.permissions) ? record.permissions : []).map((item) => String(item).trim()).filter(Boolean))) as AdminPermission[],
    passwords: Array.from(new Set((Array.isArray(record.passwords) ? record.passwords : []).map((item) => normalizeSecret(item)).filter(Boolean))),
    status,
    createdAt: String(record.createdAt || new Date().toISOString()),
    updatedAt: String(record.updatedAt || new Date().toISOString()),
  };
}

export async function listManagedAdminAccounts() {
  const data = await readAdminUsersStore();
  return data.users.map(sanitizeManagedRecord);
}

export async function createManagedAdminAccount(input: {
  displayName: string;
  email: string;
  role: Exclude<AdminRole, "owner">;
  permissions: AdminPermission[];
  password: string;
}) {
  const data = await readAdminUsersStore();
  const email = normalizeEmail(input.email);

  if (!email) {
    throw new Error("Thiếu email tài khoản.");
  }

  if (email === getFixedSuperAdminEmail()) {
    throw new Error("Email owner cố định không được tạo lại ở danh sách nhân viên.");
  }

  if (data.users.some((user) => normalizeEmail(user.email) === email)) {
    throw new Error("Email này đã tồn tại trong danh sách tài khoản phụ.");
  }

  const now = new Date().toISOString();
  const record: ManagedAdminAccountRecord = sanitizeManagedRecord({
    id: crypto.randomUUID(),
    displayName: String(input.displayName || "").trim(),
    email,
    role: input.role,
    permissions: input.permissions,
    passwords: [input.password],
    status: "active",
    createdAt: now,
    updatedAt: now,
  });

  data.users.push(record);
  await writeAdminUsersStore(data);
  return record;
}

export async function updateManagedAdminAccount(input: {
  id: string;
  displayName: string;
  email: string;
  role: Exclude<AdminRole, "owner">;
  permissions: AdminPermission[];
  status: AdminAccountStatus;
  password?: string;
}) {
  const data = await readAdminUsersStore();
  const index = data.users.findIndex((user) => user.id === input.id);
  if (index < 0) {
    throw new Error("Không tìm thấy tài khoản cần cập nhật.");
  }

  const email = normalizeEmail(input.email);
  if (!email) {
    throw new Error("Thiếu email tài khoản.");
  }

  if (email === getFixedSuperAdminEmail()) {
    throw new Error("Không thể gán email owner cố định cho tài khoản cấp dưới.");
  }

  const duplicated = data.users.some((user, userIndex) => userIndex !== index && normalizeEmail(user.email) === email);
  if (duplicated) {
    throw new Error("Email này đã tồn tại trong danh sách tài khoản phụ.");
  }

  const current = sanitizeManagedRecord(data.users[index]);
  data.users[index] = sanitizeManagedRecord({
    ...current,
    displayName: String(input.displayName || "").trim(),
    email,
    role: input.role,
    permissions: input.permissions,
    passwords: input.password ? [normalizeSecret(input.password)] : current.passwords,
    status: input.status === "disabled" ? "disabled" : "active",
    updatedAt: new Date().toISOString(),
  });

  await writeAdminUsersStore(data);
  return data.users[index];
}

export async function updateManagedAdminAccountStatus(id: string, status: AdminAccountStatus) {
  const data = await readAdminUsersStore();
  const index = data.users.findIndex((user) => user.id === id);
  if (index < 0) {
    throw new Error("Không tìm thấy tài khoản cần cập nhật.");
  }

  const current = sanitizeManagedRecord(data.users[index]);
  data.users[index] = {
    ...current,
    status: status === "disabled" ? "disabled" : "active",
    updatedAt: new Date().toISOString(),
  };
  await writeAdminUsersStore(data);
  return data.users[index];
}

export async function updateManagedAdminPassword(id: string, password: string) {
  const data = await readAdminUsersStore();
  const index = data.users.findIndex((user) => user.id === id);
  if (index < 0) {
    throw new Error("Không tìm thấy tài khoản cần đổi mật khẩu.");
  }

  const current = sanitizeManagedRecord(data.users[index]);
  data.users[index] = {
    ...current,
    passwords: [normalizeSecret(password)],
    updatedAt: new Date().toISOString(),
  };
  await writeAdminUsersStore(data);
  return data.users[index];
}

export async function deleteManagedAdminAccount(id: string) {
  const data = await readAdminUsersStore();
  const nextUsers = data.users.filter((user) => user.id !== id);
  if (nextUsers.length === data.users.length) {
    throw new Error("Không tìm thấy tài khoản cần xóa.");
  }

  await writeAdminUsersStore({ users: nextUsers });
}

export async function getAdminAccountByCredentialsFromStore(emailCandidate: string, passwordCandidate: string): Promise<AdminAccount | null> {
  const email = normalizeEmail(emailCandidate);
  if (!email) return null;

  const passwordVariants = buildCandidatePasswordVariants(passwordCandidate);
  if (passwordVariants.length === 0) return null;

  const managedAccounts = (await listManagedAdminAccounts())
    .filter((account) => account.status === "active")
    .map((account) => ({
      email: account.email,
      role: account.role,
      permissions: account.permissions,
      passwords: account.passwords,
    })) satisfies AdminAccount[];

  const allAccounts = [...getAdminAccounts(), ...managedAccounts].filter(
    (account, index, source) => source.findIndex((candidate) => candidate.email === account.email) === index,
  );

  const found = allAccounts.find((account) => {
    if (account.email !== email) return false;
    return passwordVariants.some((candidate) => account.passwords.includes(candidate));
  });

  return found ?? null;
}