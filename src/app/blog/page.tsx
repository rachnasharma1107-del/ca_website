import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Blog & Insights",
  description:
    "Tax, audit, and compliance insights from Praveen Aggarwal & Co., Chartered Accountants, New Delhi.",
  path: "/blog",
});

export const revalidate = 1800;

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <section className="section">
      <div className="container">
        <h1>Blog &amp; Insights</h1>
        <p className="lede">Practical updates on taxation, audit, and compliance.</p>
        <div className="grid" style={{ marginTop: 32 }}>
          {posts.map((post) => (
            <article className="card" key={post.id}>
              <h3>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h3>
              <p className="muted">{post.excerpt}</p>
              {post.publishedAt && (
                <p className="muted" style={{ fontSize: 12 }}>
                  {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              )}
            </article>
          ))}
          {posts.length === 0 && <p>New articles are coming soon.</p>}
        </div>
      </div>
    </section>
  );
}
