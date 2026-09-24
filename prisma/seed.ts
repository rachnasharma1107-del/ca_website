/**
 * Database seed script.
 *
 * Run with: npm run db:seed
 *
 * Seeds:
 *  1. The ONLY admin user permitted to log in (rachna.sharma1107@gmail.com).
 *     Any other email attempting the OTP login flow is rejected with a
 *     warning by /api/auth/otp/request — see that route for enforcement.
 *  2. Services, sourced from the firm's official service lines.
 *  3. A starter blog post.
 *
 * Safe to re-run: uses upsert throughout.
 */
import { PrismaClient, ContentStatus } from "@prisma/client";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "rachna.sharma1107@gmail.com";

async function main() {
  // --- 1. Pre-seeded admin (ONLY this email can log in) ---------------------
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { isActive: true },
    create: {
      email: ADMIN_EMAIL,
      name: "Rachna Sharma",
      role: "ADMIN",
      isActive: true,
    },
  });
  console.log(`✓ Seeded admin user: ${ADMIN_EMAIL}`);

  // --- 2. Services ------------------------------------------------------
  const services = [
    {
      slug: "audit-and-assurance",
      title: "Audit & Assurance Services",
      order: 1,
      summary:
        "Financial statement audits (incl. IND AS), internal audits, bank & stock audits, and GST/tax audits delivered with rigorous methodology.",
      content: `We provide industry-focused audit and assurance services for public and private clients to build trust and enhance value:

- Financial Statement Audit incl. IND AS
- Internal Audits
- Corporate Reporting Improvement
- Controls & Systems Process Assurance
- Bank Audits incl. Stock Audits
- GST and Tax Audits
- Transfer Pricing Audits
- Corporate and other legal Compliance

Whatever the size of your organization, our approach is focused on client satisfaction, excellence, and perfection.`,
    },
    {
      slug: "taxation-services",
      title: "Taxation Services",
      order: 2,
      summary:
        "Direct and indirect tax advisory, individual and trust tax advisory, and transfer pricing support for businesses of every size.",
      content: `Our taxation practice covers:

- Direct Tax Advisory Services
- In-Direct Tax Advisory Services
- Individual and Trust (U/s 11 & 12) Tax Advisory Services
- Transfer Pricing

We help clients navigate an evolving tax landscape with proactive planning and compliant, well-documented positions.`,
    },
    {
      slug: "business-advisory-services",
      title: "Business Advisory Services",
      order: 3,
      summary:
        "Project finance, financial modelling, feasibility studies, M&A due diligence, and business transformation advisory.",
      content: `Our business advisory services include:

- Project finance from Banks & Financial Institutions
- Project Management & Financial Projections
- Project Feasibilities including Modelling & Business Planning
- Financial Due Diligence, Mergers & Acquisitions Advisory (buy and sell side)
- Management Information Systems
- Business Transformation and Turnaround

Our senior partners bring extensive experience across taxation, auditing, accounting, investigation, and financial consultation to every engagement.`,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: { ...service, status: ContentStatus.PUBLISHED },
      create: { ...service, status: ContentStatus.PUBLISHED },
    });
  }
  console.log(`✓ Seeded ${services.length} services`);

  // --- 3. Starter blog post -----------------------------------------------
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

  await prisma.blogPost.upsert({
    where: { slug: "welcome-to-our-firm" },
    update: {},
    create: {
      slug: "welcome-to-our-firm",
      title: "Five Decades of Trusted Chartered Accountancy in New Delhi",
      excerpt:
        "Since 1973, Praveen Aggarwal & Co. has delivered audit, tax, and advisory services built on integrity and technical excellence.",
      content: `Established on 30th August 1973, Praveen Aggarwal & Co. is one of the oldest and most well-regarded Chartered Accountancy firms in New Delhi.

Over the decades, our senior partners have built deep expertise across Taxation, Auditing, Accounting, Investigation, and Business & Financial Consultation. Honesty, commitment, dedication, and integrity — combined with the highest professional and personal standards — remain the cornerstone of everything we do.

Our firm is empanelled with the Comptroller and Auditor General of India (Regn. No. DE0218) for audit assignments of Public Sector Banks & Undertakings/Enterprises, and has been registered with the Reserve Bank of India (Regn. No. 105802) since 30th September 1990.

We look forward to continuing to serve clients — from newly established ventures to multi-million dollar private and public concerns — with the same strategic focus on sustainable, efficient, and reliable professional service.`,
      status: ContentStatus.PUBLISHED,
      publishedAt: new Date(),
      authorId: admin?.id,
    },
  });
  console.log("✓ Seeded starter blog post");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error("Seed failed:", err);
    await prisma.$disconnect();
    process.exit(1);
  });
