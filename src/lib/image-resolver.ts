const productCardImageSlugs = new Set<string>();
const solutionCardImageSlugs = new Set(["bao-tri", "ky-thuat", "mua-hang", "chu-xuong"]);
const industryCardImageSlugs = new Set(["may-go", "cnc", "ep-nhua", "bom-quat-dong-co", "bang-tai-truyen-dong"]);

function normalizePublicPath(publicPath: string) {
  return publicPath.startsWith("/") ? publicPath : `/${publicPath}`;
}

export function resolveBrandLogo(slug: string, fallback: string) {
  return normalizePublicPath(fallback);
}

export function resolveProductCardImage(slug: string, fallback: string) {
  return productCardImageSlugs.has(slug) ? `/images/cards/products/${slug}.png` : normalizePublicPath(fallback);
}

export function resolveSolutionCardImage(slug: string, fallback: string) {
  return solutionCardImageSlugs.has(slug) ? `/images/cards/solutions/${slug}.png` : normalizePublicPath(fallback);
}

export function resolveIndustryCardImage(slug: string, fallback: string) {
  return industryCardImageSlugs.has(slug) ? `/images/cards/industry/${slug}.png` : normalizePublicPath(fallback);
}
