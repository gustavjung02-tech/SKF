import fs from "node:fs";
import path from "node:path";

type ResolveImageInput = {
  slug: string;
  directory: string;
  extensions: readonly string[];
  fallback: string;
  preferConvention?: boolean;
};

const publicRoot = path.join(process.cwd(), "public");

function normalizePublicPath(publicPath: string) {
  return publicPath.startsWith("/") ? publicPath : `/${publicPath}`;
}

function publicFileExists(publicPath: string) {
  const normalized = normalizePublicPath(publicPath);
  const diskPath = path.join(publicRoot, normalized.replace(/^\//, ""));

  return fs.existsSync(diskPath);
}

function resolveImageBySlug({ slug, directory, extensions, fallback, preferConvention = false }: ResolveImageInput) {
  const normalizedFallback = normalizePublicPath(fallback);
  const normalizedDirectory = directory.replace(/\/$/, "");
  const candidates = extensions.map((extension) => `${normalizedDirectory}/${slug}.${extension}`);
  const conventionMatch = candidates.find(publicFileExists);

  if (preferConvention && conventionMatch) {
    return conventionMatch;
  }

  if (publicFileExists(normalizedFallback)) {
    return normalizedFallback;
  }

  return conventionMatch ?? normalizedFallback;
}

export function resolveBrandLogo(slug: string, fallback: string) {
  return resolveImageBySlug({
    slug,
    directory: "/images/brands",
    extensions: ["png", "webp", "jpg", "jpeg", "svg"],
    fallback,
  });
}

export function resolveProductCardImage(slug: string, fallback: string) {
  return resolveImageBySlug({
    slug,
    directory: "/images/cards/products",
    extensions: ["webp", "png", "jpg", "jpeg"],
    fallback,
    preferConvention: true,
  });
}

export function resolveSolutionCardImage(slug: string, fallback: string) {
  return resolveImageBySlug({
    slug,
    directory: "/images/cards/solutions",
    extensions: ["webp", "png", "jpg", "jpeg"],
    fallback,
    preferConvention: true,
  });
}

export function resolveIndustryCardImage(slug: string, fallback: string) {
  return resolveImageBySlug({
    slug,
    directory: "/images/cards/industry",
    extensions: ["webp", "png", "jpg", "jpeg"],
    fallback,
    preferConvention: true,
  });
}
