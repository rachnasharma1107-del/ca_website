import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { buildMetadata, SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo/metadata";
import Hero from "@/components/home/Hero";
import About from "@/components/home/About";

export const metadata: Metadata = buildMetadata({
  title: `${SITE_NAME} | Chartered Accountants, New Delhi`,
  description: SITE_DESCRIPTION,
  path: "/",
});

export const revalidate = 3600; // ISR — SEO-friendly static-like performance, hourly refresh

export default async function HomePage() {
  const [services, posts] = await Promise.all([
    prisma.service.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { order: "asc" },
      take: 6,
    }),
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
  ]);

  return (
    <>
      <Hero />
      <About />

      {services.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <h2>Our Services</h2>
            <div className="grid">
              {services.map((service) => (
                <article className="card" key={service.id}>
                  <h3>
                    <Link href={`/services/${service.slug}`}>{service.title}</Link>
                  </h3>
                  <p className="muted">{service.summary}</p>
                </article>
              ))}
            </div>
            <p style={{ marginTop: 24 }}>
              <Link href="/services">View all services →</Link>
            </p>
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section className="section">
          <div className="container">
            <h2>Latest Insights</h2>
            <div className="grid">
              {posts.map((post) => (
                <article className="card" key={post.id}>
                  <h3>
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="muted">{post.excerpt}</p>
                </article>
              ))}
            </div>
            <p style={{ marginTop: 24 }}>
              <Link href="/blog">Read more from our blog →</Link>
            </p>
          </div>
        </section>
      )}
    </>
  );
}
