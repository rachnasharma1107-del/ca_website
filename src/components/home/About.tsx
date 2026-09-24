import Link from "next/link";
import { HoverPreview, PreviewTerm } from "@/components/ui/hover-preview";

const aboutPreviews = {
  founded: {
    title: "Practising since 1973",
    subtitle: "Established in New Delhi on 30 August 1973.",
    image: "/50-plus-years.webp",
    imageAlt: "Sculpture marking more than fifty years of practice since 1973",
  },
  foundation: {
    title: "Our foundation",
    subtitle: "Integrity, technical depth, and relationships that last.",
    image: "/trusted_business_integrity.webp",
    imageAlt: "Professional integrity at the heart of the practice",
  },
  services: {
    title: "Integrated services",
    subtitle:
      "Audit & Assurance, Taxation, Risk, Financial & Project Consultancy, Management Consultancy, and Regulatory Compliance.",
    image: "/trusted_services.webp",
    imageAlt: "Audit, taxation, risk, finance advisory and business transformation",
  },
  team: {
    title: "Our people",
    subtitle:
      "Leadership and specialists across tax, audit, accounting, investigation, and advisory.",
    image: "/herobg.webp",
    imageAlt: "The firm’s professional working environment",
  },
  clients: {
    title: "Who we serve",
    subtitle: "Emerging businesses through to large private and public enterprises.",
    image: "/hero3.webp",
    imageAlt: "Heritage, advisory and trusted client partnerships",
  },
  approach: {
    title: "How we work",
    subtitle: "Professional excellence, sound judgement, and lasting value.",
    image: "/trusted_business_integrity.webp",
    imageAlt: "A practice built on trust and professional judgement",
  },
};

export default function About() {
  return (
    <section className="about" id="about" aria-labelledby="about-heading">
      <div className="about-copy">
        <header className="about-intro">
          <p className="about-kicker">Chartered Accountants · New Delhi</p>
          <h2 id="about-heading">About the firm</h2>
        </header>
        <blockquote className="about-quote">
          <p>
            Integrity, specialised expertise, and relationships that last — from emerging
            businesses to large private and public enterprises.
          </p>
        </blockquote>
        <HoverPreview items={aboutPreviews}>
          <p>
            Established in{" "}
            <PreviewTerm id="founded">1973</PreviewTerm>, Praveen Aggarwal &amp; Co. is a
            well-established Chartered Accountancy firm in New Delhi, built on a strong
            foundation of{" "}
            <PreviewTerm id="foundation">
              professional integrity, technical expertise and long-standing client
              relationships
            </PreviewTerm>
            . For over five decades, the firm has provided{" "}
            <PreviewTerm id="services">integrated professional services</PreviewTerm>
            {" "}
            across Audit &amp; Assurance, Taxation, Risk Management, Financial and Project
            Consultancy, Management Consultancy and Regulatory Compliance.
          </p>
          <p>
            Our{" "}
            <PreviewTerm id="team">
              experienced leadership and dedicated team of professionals
            </PreviewTerm>{" "}
            bring multidisciplinary expertise across taxation, auditing, accounting,
            investigation and business advisory, enabling us to address complex financial and
            business requirements with clarity and precision. We serve clients across diverse
            stages of growth, from{" "}
            <PreviewTerm id="clients">
              emerging businesses to large private and public enterprises
            </PreviewTerm>
            , with a consistent focus on{" "}
            <PreviewTerm id="approach">
              professional excellence, sound judgement and sustainable value creation
            </PreviewTerm>
            .
          </p>
        </HoverPreview>
        <p className="about-more-wrap">
          <Link href="/about" className="about-more">
            More about the firm
          </Link>
        </p>
      </div>
      <nav className="about-ribbon" aria-label="Practice areas">
        <ul>
          <li>Bank Audits incl. Stock Audits</li>
          <li>GST and Tax Audits</li>
          <li>Transfer Pricing Audits</li>
          <li>Internal Audits</li>
          <li>Corporate Reporting Improvement</li>
        </ul>
      </nav>
    </section>
  );
}
