import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, UnauthorizedError } from "@/lib/auth/guard";
import { serviceSchema } from "@/lib/validations/content";
import { logAudit } from "@/lib/audit";

export async function GET() {
  try {
    await requireSession();
    const services = await prisma.service.findMany({ orderBy: { order: "asc" } });
    return NextResponse.json({ items: services });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession();

    const json = await request.json().catch(() => null);
    const parsed = serviceSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed.", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.service.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) {
      return NextResponse.json({ error: "A service with this slug already exists." }, { status: 409 });
    }

    const service = await prisma.service.create({
      data: {
        ...parsed.data,
        icon: parsed.data.icon || null,
        metaTitle: parsed.data.metaTitle || null,
        metaDescription: parsed.data.metaDescription || null,
      },
    });

    await logAudit({
      action: "SERVICE_CREATED",
      actorType: "USER",
      actorId: session.sub,
      targetId: service.id,
    });

    return NextResponse.json({ item: service }, { status: 201 });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[admin/services] POST failed", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
