import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import LogoutButton from "@/components/ui/LogoutButton";

export const metadata: Metadata = { title: "Admin Dashboard", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Defense in depth: middleware already checks the JWT for /admin/*, but we
  // re-verify server-side here (with DB-backed revocation) before rendering
  // any admin data.
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div style={{ padding: "0 24px 20px", fontWeight: 700 }}>Admin Panel</div>
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/enquiries">Enquiries</Link>
        <Link href="/admin/blog">Blog Posts</Link>
        <Link href="/admin/services">Services</Link>
        <Link href="/">← Back to site</Link>
      </aside>
      <div className="admin-main">
        <div className="admin-topbar">
          <span className="muted">Signed in as {session.email}</span>
          <LogoutButton />
        </div>
        {children}
      </div>
    </div>
  );
}
