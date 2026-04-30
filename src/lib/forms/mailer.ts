import { siteConfig } from "@/config/site";

const DEFAULT_INTERNAL_RECIPIENT = "khuongbinh.info@gmail.com";
const DEFAULT_FROM = "SKF Công Nghiệp <onboarding@resend.dev>";
const DEFAULT_ASSET_BASE_URL = `https://${siteConfig.domain}`;

type SendMailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

function readNonEmptyEnv(name: string) {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : null;
}

function normalizeAssetBaseUrl(rawUrl: string) {
  const trimmed = rawUrl.trim().replace(/\/+$/, "");
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is missing");
  }
  return apiKey;
}

export function getInternalRecipient() {
  return readNonEmptyEnv("FORM_MAIL_TO") ?? DEFAULT_INTERNAL_RECIPIENT;
}

export function getMailFromAddress() {
  const configured = readNonEmptyEnv("FORM_MAIL_FROM");

  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("FORM_MAIL_FROM is missing");
  }

  return DEFAULT_FROM;
}

export function getMailAssetBaseUrl() {
  const configured = readNonEmptyEnv("FORM_ASSET_BASE_URL");
  return normalizeAssetBaseUrl(configured && configured.trim().length > 0 ? configured : DEFAULT_ASSET_BASE_URL);
}

export function buildMailBrandHeaderHtml() {
  const baseUrl = getMailAssetBaseUrl();
  const logo = `${baseUrl}/images/logo-skf-cong-nghiep-header.png`;

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;margin:0 0 18px 0;">
      <tr>
        <td style="padding:14px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;">
          <div style="padding:10px;border:1px solid #cbd5e1;border-radius:10px;background:#ffffff;text-align:center;">
            <img src="${logo}" alt="SKF Công Nghiệp" style="height:42px;width:auto;max-width:220px;display:inline-block;" />
          </div>
        </td>
      </tr>
    </table>
  `;
}

export async function sendMail(input: SendMailInput) {
  const apiKey = getResendClient();
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getMailFromAddress(),
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      ...(input.replyTo ? { reply_to: input.replyTo } : {}),
    }),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | { error?: { message?: string } }
    | null;

  if (!response.ok) {
    const message = payload?.error?.message ?? `Resend request failed with status ${response.status}`;
    throw new Error(message);
  }

  if (payload?.error?.message) {
    throw new Error(payload.error.message);
  }

  return {
    from: getMailFromAddress(),
    to: input.to,
    subject: input.subject,
  };
}
