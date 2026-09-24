# Praveen Aggarwal & Co. — Website

Enterprise-grade Next.js website for a Chartered Accountancy firm, with a
robust backend: passwordless OTP admin auth, an enquiry pipeline, and a
content-managed Services/Blog system. Built SEO-first.

## Tech stack

- Next.js **16.2.3** (App Router)
- TypeScript **5.9.3** (strict mode)
- Prisma **6.19** + PostgreSQL
- Node **22.22.3** / npm **10.9.7**
- Auth: custom email OTP (no passwords), `jose` for JWT sessions
- Email: `nodemailer` (SMTP), console fallback in dev

## Architecture

```
src/
  app/                    # Routes (pages + API)
    (public pages)        home, services, blog, contact, login
    admin/                 protected dashboard (enquiries, blog, services CRUD)
    api/
      auth/                otp request/verify, session, logout
      contact/              public enquiry submission
      admin/                 protected CRUD endpoints
    sitemap.ts, robots.ts   dynamic SEO routes
  components/
    layout/                Navbar (services dropdown), Footer (login link)
    forms/                  ContactForm, LoginForm (client components)
    admin/                  Admin CRUD tables/forms
  lib/
    prisma.ts               DB client singleton
    env.ts                  zod-validated environment variables
    auth/                   otp.ts, session.ts, mailer.ts, guard.ts
    validations/            zod schemas (auth, contact, content)
    seo/                    metadata.ts, jsonld.ts
    rate-limit.ts, audit.ts
  middleware.ts             edge-level /admin gate
prisma/
  schema.prisma
  seed.ts                   seeds the ONLY allowed admin + starter content
```

## Security & auth model

- **Passwordless, whitelist-only login.** Only pre-seeded, active `User`
  rows can request an OTP. All other emails are rejected with an explicit
  warning message at `/api/auth/otp/request` (see that file) — this is the
  requirement "only pre-seeded emails can log in; show a warning otherwise."
- OTP codes are 6 digits, hashed (SHA-256 + server pepper) before storage,
  single-use, expire in `OTP_TTL_MINUTES`, and are attempt-limited.
- Sessions are signed JWTs **backed by a revocable DB record** (`Session`),
  so logout / admin deactivation take effect immediately even if a JWT
  hasn't expired yet.
- `middleware.ts` gates `/admin/*` at the edge (fast JWT check); every admin
  API route re-verifies the session against the database
  (`requireSession()`) before touching data — defense in depth.
- Rate limiting on OTP request/verify and the public contact form.
- Contact form has a honeypot field + origin allow-list + zod validation.
- Global security headers (CSP, HSTS, X-Frame-Options, etc.) in
  `next.config.ts`.
- All inputs validated server-side with `zod`, independent of client-side
  validation.
- `AuditLog` records security-relevant events (logins, OTP failures,
  content changes, enquiry submissions).

## SEO

- Server-rendered/ISR pages for Home, Services, Blog (fast, crawlable).
- Per-page `generateMetadata` (canonical URLs, Open Graph, Twitter cards).
- JSON-LD structured data: Organization, Service, BlogPosting, Breadcrumbs.
- Dynamic `sitemap.xml` (reflects published services/posts) and
  `robots.txt` (disallows `/admin`, `/login`, `/api`).
- Clean, semantic HTML; lightweight CSS (no heavy framework/JS payload).

## Local setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start PostgreSQL locally** (example via Docker):
   ```bash
   docker run --name ca-postgres -e POSTGRES_USER=ca_admin \
     -e POSTGRES_PASSWORD=ca_password -e POSTGRES_DB=ca_website \
     -p 5432:5432 -d postgres:16
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # generate a real secret:
   openssl rand -base64 48
   # paste it into SESSION_SECRET in .env
   ```
   Leave `SMTP_HOST` blank to have OTP codes logged to your terminal
   instead of emailed — convenient for local development.

4. **Run migrations & seed the database**
   ```bash
   npx prisma migrate dev --name init
   npm run db:seed
   ```
   This creates the **only** allowed admin account:
   `rachna.sharma1107@gmail.com`, plus the firm's services and a starter
   blog post.

5. **Start the dev server**
   ```bash
   npm run dev
   ```
   Visit `http://localhost:3000`. Go to `/login`, enter
   `rachna.sharma1107@gmail.com`, and read the OTP from your terminal
   (since SMTP isn't configured locally).

## Production notes

- Set a real `SMTP_HOST`/credentials, a strong unique `SESSION_SECRET`,
  and `NEXT_PUBLIC_SITE_URL` to your real domain.
- Run `npx prisma migrate deploy` (not `migrate dev`) in production.
- The in-memory rate limiter (`src/lib/rate-limit.ts`) is single-instance;
  swap it for Redis/Upstash if you scale to multiple server instances.
- To add another admin, insert a row into `User` (via Prisma Studio or a
  migration) — there is intentionally no public sign-up flow.
