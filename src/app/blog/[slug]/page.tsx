import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo/metadata";
import { blogPostingJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { safeJsonLd } from "@/lib/seo/safe-json-ld";

export const revalidate = 1800;

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string) {
  return prisma.blogPost.findFirst({ where: { slug, status: "PUBLISHED" } });
}

export async function generateStaticParams() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return buildMetadata({ title: "Post not found", description: "", path: `/blog/${slug}` });

  return buildMetadata({
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.coverImage || undefined,
    type: "article",
  });
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <article className="section">
      <div className="container" style={{ maxWidth: 760 }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd([
              blogPostingJsonLd(post),
              breadcrumbJsonLd([
                { name: "Home", path: "/" },
                { name: "Blog", path: "/blog" },
                { name: post.title, path: `/blog/${post.slug}` },
              ]),
            ]),
          }}
        />
        <nav aria-label="Breadcrumb" className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
          <Link href="/">Home</Link> / <Link href="/blog">Blog</Link> / {post.title}
        </nav>
        <h1>{post.title}</h1>
        {post.publishedAt && (
          <p className="muted" style={{ fontSize: 13 }}>
            {new Date(post.publishedAt).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
        {post.coverImage && <img src={post.coverImage} alt={post.title} style={{ borderRadius: 6, margin: "16px 0" }} />}
        <div style={{ whiteSpace: "pre-wrap" }}>{post.content}</div>
      </div>
    </article>
  );
}
