import type { Metadata } from "next";
import LoginForm from "@/components/forms/LoginForm";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Admin Login",
  description: "Sign in to the admin dashboard.",
  path: "/login",
  noIndex: true,
});

interface PageProps {
  searchParams: Promise<{ from?: string }>;
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { from } = await searchParams;
  const redirectTo = from && from.startsWith("/admin") ? from : "/admin";

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 420 }}>
        <h1>Admin Login</h1>
        <p className="lede">Sign in with your registered email to manage the site.</p>
        <LoginForm redirectTo={redirectTo} />
      </div>
    </section>
  );
}
