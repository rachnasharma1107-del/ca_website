import Link from "next/link";
import type { Metadata } from "next";
import { buildMetadata, SITE_NAME } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "About Us",
  description:
    "About Praveen Aggarwal & Co., Chartered Accountants — a New Delhi firm established in 1973, empanelled with CAG and registered with RBI.",
  path: "/about",
});

export const revalidate = 3600;

export default function AboutPage() {
  return (
    <section className="section">
      <div className="container">
        <h1>About Us</h1>
        <p className="lede">
          Chartered Accountants in New Delhi since 1973 — professional integrity, specialised
          expertise, and a long record of public and private client work.
        </p>

        <p>
          Established on 30th August 1973, {SITE_NAME} is one of the oldest and most respected
          Chartered Accountancy firms in New Delhi. We provide comprehensive professional
          services across Audit &amp; Assurance, Risk Management, Direct and Indirect Tax
          Consultancy, Project &amp; Financial Consultancy, Management Consultancy, and
          regulatory compliance.
        </p>
        <p>
          Our firm is empanelled with the Comptroller and Auditor General of India (Regn. No.
          DE0218) and registered with the Reserve Bank of India (Regn. No. 105802) since 30th
          September 1990. A dedicated team of professionals across specializations is the key
          to our success.
        </p>
        <p>
          ICAI Firm Registration No. 000044N. Head office at 23 LGF, Bhai Veer Singh Marg, Gole
          Market, New Delhi – 110001, with branch offices in Noida and Behror.
        </p>

        <p style={{ marginTop: 32 }}>
          <Link href="/contact" className="btn">
            Request a consultation
          </Link>
        </p>
      </div>
    </section>
  );
}
