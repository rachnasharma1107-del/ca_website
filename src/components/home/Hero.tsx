import Image from "next/image";
import Link from "next/link";

const practices = ["Audit", "Taxation", "Risk", "Advisory"] as const;

export default function Hero() {
  const established = 1973;
  const today = new Date().getFullYear();

  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero-media">
        <Image
          src="/trusted_services.webp"
          alt="The Institute of Chartered Accountants of India mark"
          fill
          priority
          quality={75}
          sizes="100vw"
          className="hero-photo-image"
        />
        <div className="hero-fade" aria-hidden="true" />
      </div>

      <div className="hero-copy">
        <p className="hero-year" aria-hidden="true">
          {established}
        </p>
        <p className="hero-eyebrow">Chartered accountants, New Delhi</p>
        <h1 id="hero-heading">Comprehensive financial and business advisory</h1>
        <p className="hero-lede">
          Audit, taxation, risk, and advisory work from one firm — practised here
          since {established}.
        </p>
        <p className="hero-proof">C&amp;AG empanelled. RBI registered.</p>
        <div className="hero-actions">
          <Link href="/contact" className="btn">
            Contact us
          </Link>
          <Link href="/services" className="hero-inline-link">
            Our services
          </Link>
        </div>
      </div>

      <div className="hero-register" aria-hidden="true">
        <span className="hero-register-year">{established}</span>
        <div className="hero-register-track">
          <span className="hero-register-rule" />
          <ul>
            {practices.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <span className="hero-register-year">{today}</span>
      </div>
    </section>
  );
}
