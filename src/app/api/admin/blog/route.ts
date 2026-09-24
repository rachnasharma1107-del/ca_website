import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, UnauthorizedError } from "@/lib/auth/guard";
import { blogPostSchema } from "@/lib/validations/content";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    await requireSession();
    const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ items: posts });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[admin/blog] GET failed", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();

    const json = await request.json().catch(() => null);
    const parsed = blogPostSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed.", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.blogPost.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) {
      return NextResponse.json({ error: "A post with this slug already exists." }, { status: 409 });
    }

    const post = await prisma.blogPost.create({
      data: {
        ...parsed.data,
        coverImage: parsed.data.coverImage || null,
        metaTitle: parsed.data.metaTitle || null,
        metaDescription: parsed.data.metaDescription || null,
        authorId: session.sub,
        publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null,
      },
    });

    await logAudit({
      action: "BLOG_POST_CREATED",
      actorType: "USER",
      actorId: session.sub,
      targetId: post.id,
    });

    return NextResponse.json({ item: post }, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[admin/blog] POST failed", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
