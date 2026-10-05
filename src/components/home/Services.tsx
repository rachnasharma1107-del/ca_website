import Link from "next/link";
import { ArrowUpRight, BadgeCheck, BarChart3, BriefcaseBusiness, FileCheck2, Landmark, Scale, type LucideIcon } from "lucide-react";
import styles from "./Services.module.css";

type ServiceItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
};

type ServicesPreviewProps = {
  services: ServiceItem[];
};

const serviceIcons: LucideIcon[] = [BarChart3, FileCheck2, Landmark, Scale, BriefcaseBusiness, BadgeCheck];

export default function ServicesPreview({ services }: ServicesPreviewProps) {
  if (!services.length) return null;

  return (
    <section className={styles.root} aria-labelledby="services-heading">
      <div className={styles.orbOne} aria-hidden="true" />
      <div className={styles.orbTwo} aria-hidden="true" />
      <div className={styles.container}>
        <div className={styles.intro}>
          <div>
            <p className={styles.kicker}><span /> What we do</p>
            <h2 id="services-heading">Expertise that moves your<em> business forward.</em></h2>
          </div>
          <div className={styles.introAside}>
            <p>Clear thinking, disciplined execution, and advice that gives you confidence at every important decision.</p>
            <Link href="/services" className={styles.allServices}>Explore all services <ArrowUpRight size={17} strokeWidth={2.2} /></Link>
          </div>
        </div>

        <div className={styles.serviceList}>
          {services.map((service, index) => (
            <ServiceLink service={service} index={index} key={service.id} />
          ))}
        </div>
        <div className={styles.footerLine}>
          <p>Partnering with ambitious businesses for over five decades.</p>
          <Link href="/contact" className={styles.conversationLink}>Start a conversation <span>→</span></Link>
        </div>
      </div>
    </section>
  );
}

function ServiceLink({ service, index }: { service: ServiceItem; index: number }) {
  const Icon = serviceIcons[index % serviceIcons.length] ?? BadgeCheck;
  return (
    <Link href={`/services/${service.slug}`} className={styles.service}>
      <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
      <span className={styles.iconWrap}><Icon size={23} strokeWidth={1.65} /></span>
      <span className={styles.serviceContent}>
        <span className={styles.title}>{service.title}</span>
        <span className={styles.summary}>{service.summary}</span>
      </span>
      <span className={styles.arrow} aria-hidden="true"><ArrowUpRight size={22} /></span>
    </Link>
  );
}
