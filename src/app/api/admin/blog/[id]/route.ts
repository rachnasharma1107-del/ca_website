import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, UnauthorizedError } from "@/lib/auth/guard";
import { blogPostSchema } from "@/lib/validations/content";
import { logAudit } from "@/lib/audit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireSession();
    const { id } = await params;
    const post = await prisma.blogPost.findUnique({ where: { id } });
    if (!post) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ item: post });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireSession();
    const { id } = await params;

    const json = await request.json().catch(() => null);
    const parsed = blogPostSchema.partial().safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed.", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const current = await prisma.blogPost.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ error: "Not found." }, { status: 404 });

    const willPublishNow = parsed.data.status === "PUBLISHED" && current.status !== "PUBLISHED";

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...parsed.data,
        publishedAt: willPublishNow ? new Date() : undefined,
      },
    });

    await logAudit({
      action: "BLOG_POST_UPDATED",
      actorType: "USER",
      actorId: session.sub,
      targetId: id,
    });

    return NextResponse.json({ item: post });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[admin/blog/:id] PATCH failed", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireSession();
    const { id } = await params;
    await prisma.blogPost.delete({ where: { id } });
    await logAudit({
      action: "BLOG_POST_DELETED",
      actorType: "USER",
      actorId: session.sub,
      targetId: id,
    });
    return NextResponse.json({ message: "Post deleted." });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
