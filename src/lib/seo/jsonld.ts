import { SITE_URL, SITE_NAME } from "@/lib/seo/metadata";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "AccountingService",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.webp`,
    image: `${SITE_URL}/logo.webp`,
    description:
      "Chartered Accountants firm in New Delhi established in 1973, providing Audit & Assurance, Taxation, and Business Advisory services.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "23 LGF, Bhai Veer Singh Marg, Gole Market",
      addressLocality: "New Delhi",
      postalCode: "110001",
      addressCountry: "IN",
    },
    telephone: "+91-11-2336-8424",
    foundingDate: "1973-08-30",
    sameAs: [],
  };
}

export function serviceJsonLd(service: { title: string; summary: string; slug: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: service.title,
    description: service.summary,
    provider: { "@type": "AccountingService", name: SITE_NAME, url: SITE_URL },
    url: `${SITE_URL}/services/${service.slug}`,
  };
}

export function blogPostingJsonLd(post: {
  title: string;
  excerpt: string;
  slug: string;
  publishedAt: Date | null;
  updatedAt: Date;
  coverImage: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage ? [post.coverImage] : undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.webp` },
    },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
