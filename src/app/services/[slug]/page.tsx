import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo/metadata";
import { serviceJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { safeJsonLd } from "@/lib/seo/safe-json-ld";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getService(slug: string) {
  return prisma.service.findFirst({ where: { slug, status: "PUBLISHED" } });
}

export async function generateStaticParams() {
  const services = await prisma.service.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return buildMetadata({ title: "Service not found", description: "", path: `/services/${slug}` });

  return buildMetadata({
    title: service.metaTitle || service.title,
    description: service.metaDescription || service.summary,
    path: `/services/${service.slug}`,
  });
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) notFound();

  return (
    <section className="section">
      <div className="container">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd([
              serviceJsonLd(service),
              breadcrumbJsonLd([
                { name: "Home", path: "/" },
                { name: "Services", path: "/services" },
                { name: service.title, path: `/services/${service.slug}` },
              ]),
            ]),
          }}
        />
        <nav aria-label="Breadcrumb" className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
          <Link href="/">Home</Link> / <Link href="/services">Services</Link> / {service.title}
        </nav>
        <h1>{service.title}</h1>
        <p className="lede">{service.summary}</p>
        <div style={{ whiteSpace: "pre-wrap" }}>{service.content}</div>
        <p style={{ marginTop: 32 }}>
          <Link href={`/contact?service=${service.slug}`} className="btn">
            Enquire about this service
          </Link>
        </p>
      </div>
    </section>
  );
}
