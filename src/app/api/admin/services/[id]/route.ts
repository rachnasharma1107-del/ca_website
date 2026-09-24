import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, UnauthorizedError } from "@/lib/auth/guard";
import { serviceSchema } from "@/lib/validations/content";
import { logAudit } from "@/lib/audit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireSession();
    const { id } = await params;
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) return NextResponse.json({ error: "Not found." }, { status: 404 });
    return NextResponse.json({ item: service });
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
    const parsed = serviceSchema.partial().safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed.", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const service = await prisma.service.update({ where: { id }, data: parsed.data });

    await logAudit({
      action: "SERVICE_UPDATED",
      actorType: "USER",
      actorId: session.sub,
      targetId: id,
    });

    return NextResponse.json({ item: service });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[admin/services/:id] PATCH failed", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireSession();
    const { id } = await params;
    await prisma.service.delete({ where: { id } });
    await logAudit({
      action: "SERVICE_DELETED",
      actorType: "USER",
      actorId: session.sub,
      targetId: id,
    });
    return NextResponse.json({ message: "Service deleted." });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
