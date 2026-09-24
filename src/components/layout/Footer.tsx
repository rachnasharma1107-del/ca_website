import Link from "next/link";
import { SITE_NAME } from "@/lib/seo/metadata";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h4>{SITE_NAME}</h4>
            <p style={{ color: "#cfdbe6", fontSize: 14 }}>
              Chartered Accountants in New Delhi since 1973 — Audit & Assurance, Taxation, and
              Business Advisory Services.
            </p>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/services">Services</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4>Head Office</h4>
            <ul>
              <li>23 LGF, Bhai Veer Singh Marg,</li>
              <li>Gole Market, New Delhi – 110001</li>
              <li>+91-11-2336 8424</li>
            </ul>
          </div>
          <div>
            <h4>Admin</h4>
            <ul>
              <li><Link href="/login">Admin Login</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; {year} {SITE_NAME}. All rights reserved.</span>
          <span>ICAI Firm Regn. No. 000044N</span>
        </div>
      </div>
    </footer>
  );
}
