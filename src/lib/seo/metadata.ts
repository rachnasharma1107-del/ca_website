import type { Metadata } from "next";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Praveen Aggarwal & Co.";
export const SITE_DESCRIPTION =
  "Praveen Aggarwal & Co., Chartered Accountants — a New Delhi firm established in 1973 providing Audit & Assurance, Taxation, and Business Advisory services.";

interface BuildMetadataInput {
  title: string;
  description: string;
  path: string; // e.g. "/services/tax-audit"
  image?: string;
  noIndex?: boolean;
  type?: "website" | "article";
}

export function buildMetadata({
  title,
  description,
  path,
  image = "/og-default.png",
  noIndex = false,
  type = "website",
}: BuildMetadataInput): Metadata {
  const url = new URL(path, SITE_URL).toString();
  const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      type,
      images: [{ url: new URL(image, SITE_URL).toString() }],
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [new URL(image, SITE_URL).toString()],
    },
  };
}
