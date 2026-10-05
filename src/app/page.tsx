import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { buildMetadata, SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo/metadata";
import Hero from "@/components/home/Hero";
import About from "@/components/home/About";
import ServicesPreview from "@/components/home/Services";
import Insights from "@/components/home/Insights";

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
      <ServicesPreview services={services} />
      {posts.length > 0 && <Insights posts={posts} />}
    </>
  );
}
