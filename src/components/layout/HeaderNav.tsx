"use client";

import { useCallback, useEffect, useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavService = {
  slug: string;
  title: string;
};

interface HeaderNavProps {
  services: NavService[];
  siteName: string;
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function HeaderNav({ services, siteName }: HeaderNavProps) {
  const pathname = usePathname();
  const menuId = useId();
  const submenuId = useId();
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    setServicesOpen(false);
  }, []);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeMenu();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia("(min-width: 901px)").matches) closeMenu();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [closeMenu]);

  const brandLead = siteName.split("&")[0];

  return (
    <header className={`site-header${menuOpen ? " is-nav-open" : ""}`}>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <div className="header-accent" aria-hidden="true" />
      <nav className="container nav-row" aria-label="Primary">
        <Link href="/" className="brand" aria-label={`${siteName} home`} onClick={closeMenu}>
          <span className="brand-mark">
            <Image
              src="/logo.webp"
              alt="CA India"
              width={1774}
              height={887}
              priority
              sizes="80px"
              className="brand-logo"
            />
          </span>
          <span className="brand-copy">
            <span className="brand-name">
              {brandLead}
              <span>&amp; Co.</span>
            </span>
            <span className="brand-tagline">Chartered Accountants</span>
          </span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="nav-toggle-bars" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>

        <ul id={menuId} className="nav-links">
          <li>
            <Link href="/" aria-current={isActivePath(pathname, "/") ? "page" : undefined}>
              Home
            </Link>
          </li>
          <li className={`nav-dropdown${servicesOpen ? " is-open" : ""}`}>
            <div className="nav-dropdown-trigger">
              <Link
                href="/services"
                aria-haspopup="true"
                aria-current={isActivePath(pathname, "/services") ? "page" : undefined}
              >
                Services
              </Link>
              <button
                type="button"
                className="nav-chevron"
                aria-expanded={servicesOpen}
                aria-controls={submenuId}
                aria-label="Toggle services menu"
                onClick={() => setServicesOpen((open) => !open)}
              >
                <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
                  <path
                    d="M3.2 5.6 8 10.4l4.8-4.8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <ul id={submenuId} className="nav-dropdown-menu">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link href={`/services/${service.slug}`}>{service.title}</Link>
                </li>
              ))}
              <li>
                <Link href="/services" className="nav-dropdown-all">
                  View all services
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <Link href="/blog" aria-current={isActivePath(pathname, "/blog") ? "page" : undefined}>
              Blog
            </Link>
          </li>
          <li>
            <Link href="/about" aria-current={isActivePath(pathname, "/about") ? "page" : undefined}>
              About Us
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="nav-cta rainbow-surface"
              aria-current={isActivePath(pathname, "/contact") ? "page" : undefined}
            >
              Contact Us
            </Link>
          </li>
        </ul>
      </nav>
      <div className="header-rainbow" aria-hidden="true" />
      <button
        type="button"
        className="nav-backdrop"
        hidden={!menuOpen}
        aria-label="Close menu"
        tabIndex={menuOpen ? 0 : -1}
        onClick={closeMenu}
      />
    </header>
  );
}
