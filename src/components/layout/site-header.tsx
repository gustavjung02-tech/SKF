import { getCoreBrandLogos } from "@/data/brand-logos";
import { SiteHeaderClient } from "@/components/layout/site-header-client";

export function SiteHeader() {
  return <SiteHeaderClient coreBrands={getCoreBrandLogos()} />;
}
