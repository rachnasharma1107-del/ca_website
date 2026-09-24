import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, UnauthorizedError } from "@/lib/auth/guard";
import { enquiryStatusSchema } from "@/lib/validations/content";
import { logAudit } from "@/lib/audit";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireSession();
    const { id } = await params;

    const json = await request.json().catch(() => null);
    const parsed = enquiryStatusSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const enquiry = await prisma.enquiry.update({
      where: { id },
      data: { status: parsed.data.status },
    });

    await logAudit({
      action: "ENQUIRY_STATUS_UPDATED",
      actorType: "USER",
      actorId: session.sub,
      targetId: id,
      metadata: { status: parsed.data.status },
    });

    return NextResponse.json({ item: enquiry });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[admin/enquiries/:id] PATCH failed", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireSession();
    const { id } = await params;

    await prisma.enquiry.delete({ where: { id } });

    await logAudit({
      action: "ENQUIRY_DELETED",
      actorType: "USER",
      actorId: session.sub,
      targetId: id,
    });

    return NextResponse.json({ message: "Enquiry deleted." });
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[admin/enquiries/:id] DELETE failed", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
