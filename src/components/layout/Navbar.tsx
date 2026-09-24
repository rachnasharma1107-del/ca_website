import { prisma } from "@/lib/prisma";
import { SITE_NAME } from "@/lib/seo/metadata";
import HeaderNav from "@/components/layout/HeaderNav";

export default async function Navbar() {
  const services = await prisma.service.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, title: true },
    orderBy: { order: "asc" },
    take: 12,
  });

  return <HeaderNav services={services} siteName={SITE_NAME} />;
}
