import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ServiceForm from "@/components/admin/ServiceForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditServicePage({ params }: PageProps) {
  const { id } = await params;
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) notFound();

  return (
    <div>
      <h1>Edit Service</h1>
      <ServiceForm
        initial={{
          id: service.id,
          slug: service.slug,
          title: service.title,
          summary: service.summary,
          content: service.content,
          icon: service.icon ?? "",
          order: service.order,
          status: service.status,
          metaTitle: service.metaTitle ?? "",
          metaDescription: service.metaDescription ?? "",
        }}
      />
    </div>
  );
}
