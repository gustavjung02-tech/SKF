import { siteConfig } from "@/config/site";

type BreadcrumbItem = {
  name: string;
  path: string;
};

type WebPageSchemaInput = {
  title: string;
  description: string;
  path: string;
  type?: "WebPage" | "AboutPage" | "CollectionPage" | "ContactPage";
};

type ProductSchemaInput = {
  name: string;
  description: string;
  path: string;
  image?: string;
  brandName?: string;
  category?: string;
};

const siteUrl = `https://${siteConfig.domain}`;

function toAbsoluteUrl(pathOrUrl?: string) {
  if (!pathOrUrl) return undefined;
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;

  return `${siteUrl}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

export function createOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.brandName,
    url: siteUrl,
    logo: `${siteUrl}${siteConfig.defaultOgImage}`,
    description: siteConfig.slogan,
    telephone: siteConfig.phone,
    areaServed: "VN",
    sameAs: [siteConfig.zaloLink],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        telephone: siteConfig.phone,
        areaServed: "VN",
        availableLanguage: ["vi"],
      },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address,
      addressCountry: "VN",
    },
  };
}

export function createWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.brandName,
    url: siteUrl,
    inLanguage: "vi-VN",
    description: siteConfig.slogan,
  };
}

export function createWebPageSchema({ title, description, path, type = "WebPage" }: WebPageSchemaInput) {
  const url = `${siteUrl}${path}`;

  return {
    "@context": "https://schema.org",
    "@type": type,
    name: title,
    description,
    url,
    inLanguage: "vi-VN",
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.brandName,
      url: siteUrl,
    },
  };
}

export function createBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}

export function createProductSchema({
  name,
  description,
  path,
  image,
  brandName,
  category = "Vật tư truyền động công nghiệp",
}: ProductSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    url: `${siteUrl}${path}`,
    image: toAbsoluteUrl(image),
    category,
    brand: brandName
      ? {
          "@type": "Brand",
          name: brandName,
        }
      : undefined,
    seller: {
      "@type": "Organization",
      name: siteConfig.brandName,
      url: siteUrl,
      telephone: siteConfig.phone,
    },
  };
}
