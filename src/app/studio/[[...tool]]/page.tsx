import { notFound, redirect } from "next/navigation";

function getStudioExternalUrl() {
  const value = process.env.STUDIO_EXTERNAL_URL?.trim();
  if (!value) {
    return null;
  }

  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export default function StudioPage() {
  const studioUrl = getStudioExternalUrl();

  if (studioUrl) {
    redirect(studioUrl);
  }

  notFound();
}
