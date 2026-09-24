import type { Metadata } from "next";
import ContactForm from "@/components/forms/ContactForm";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Contact Us",
  description:
    "Get in touch with Praveen Aggarwal & Co., Chartered Accountants — New Delhi, Noida, and Behror offices.",
  path: "/contact",
});

interface PageProps {
  searchParams: Promise<{ service?: string }>;
}

export default async function ContactPage({ searchParams }: PageProps) {
  const { service } = await searchParams;
  const services = await prisma.service.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, title: true },
    orderBy: { order: "asc" },
    take: 12,
  });

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 640 }}>
        <h1>Contact Us</h1>
        <p className="lede">
          Reach out to our team for audit, taxation, and business advisory support.
        </p>
        <ContactForm defaultServiceSlug={service} services={services} />

        <div style={{ marginTop: 48 }}>
          <h2>Our Offices</h2>
          <p>
            <strong>Head Office:</strong> 23 LGF, Bhai Veer Singh Marg, Gole Market, New Delhi –
            110001
            <br />
            <strong>Branch — Uttar Pradesh:</strong> F-7, Ground Floor, Sector-3, Noida, 201301
            <br />
            <strong>Branch — Rajasthan:</strong> Ward No. 1, H. No. 154, Narnaul Road, Near Om
            Hospital, Behror, Alwar District, Rajasthan – 301701
            <br />
            <strong>Tel:</strong> +91-11-2336 8424
          </p>
        </div>
      </div>
    </section>
  );
}
