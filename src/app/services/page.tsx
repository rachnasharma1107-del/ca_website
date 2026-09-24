import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Our Services",
  description:
    "Audit & Assurance, Taxation, and Business Advisory services from Praveen Aggarwal & Co., Chartered Accountants, New Delhi.",
  path: "/services",
});

export const revalidate = 3600;

export default async function ServicesPage() {
  const services = await prisma.service.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { order: "asc" },
  });

  return (
    <section className="section">
      <div className="container">
        <h1>Our Services</h1>
        <p className="lede">
          We provide industry-focused services for public and private clients, combining
          committed methodology with the highest professional standards.
        </p>
        <div className="grid" style={{ marginTop: 32 }}>
          {services.map((service) => (
            <article className="card" key={service.id}>
              <h3>
                <Link href={`/services/${service.slug}`}>{service.title}</Link>
              </h3>
              <p className="muted">{service.summary}</p>
              <Link href={`/services/${service.slug}`}>Learn more →</Link>
            </article>
          ))}
          {services.length === 0 && <p>Services will be listed here shortly.</p>}
        </div>
      </div>
    </section>
  );
}
