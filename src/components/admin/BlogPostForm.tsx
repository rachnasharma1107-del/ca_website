"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { formatApiError } from "@/lib/format-api-error";

interface BlogPostData {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  metaTitle: string;
  metaDescription: string;
}

const empty: BlogPostData = {
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  coverImage: "",
  status: "DRAFT",
  metaTitle: "",
  metaDescription: "",
};

export default function BlogPostForm({ initial }: { initial?: BlogPostData }) {
  const router = useRouter();
  const [data, setData] = useState<BlogPostData>(initial ?? empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(initial?.id);

  function set<K extends keyof BlogPostData>(key: K, value: BlogPostData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const endpoint = isEdit ? `/api/admin/blog/${initial!.id}` : "/api/admin/blog";
    const method = isEdit ? "PATCH" : "POST";

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();

      if (!res.ok) {
        setError(formatApiError(body));
        setSaving(false);
        return;
      }

      router.push("/admin/blog");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          required
          value={data.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </div>

      <div className="form-field">
        <label htmlFor="slug">Slug (URL path — lowercase, hyphenated)</label>
        <input
          id="slug"
          required
          value={data.slug}
          onChange={(e) => set("slug", e.target.value)}
          placeholder="e.g. gst-filing-deadlines-2026"
        />
      </div>

      <div className="form-field">
        <label htmlFor="excerpt">Excerpt (used in listings & meta description fallback)</label>
        <textarea
          id="excerpt"
          required
          value={data.excerpt}
          onChange={(e) => set("excerpt", e.target.value)}
        />
      </div>

      <div className="form-field">
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          required
          style={{ minHeight: 280 }}
          value={data.content}
          onChange={(e) => set("content", e.target.value)}
        />
      </div>

      <div className="form-field">
        <label htmlFor="coverImage">Cover image URL (optional)</label>
        <input
          id="coverImage"
          value={data.coverImage}
          onChange={(e) => set("coverImage", e.target.value)}
        />
      </div>

      <div className="form-field">
        <label htmlFor="status">Status</label>
        <select id="status" value={data.status} onChange={(e) => set("status", e.target.value as BlogPostData["status"])}>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="metaTitle">SEO title (optional, ≤ 70 chars)</label>
        <input
          id="metaTitle"
          maxLength={70}
          value={data.metaTitle}
          onChange={(e) => set("metaTitle", e.target.value)}
        />
      </div>

      <div className="form-field">
        <label htmlFor="metaDescription">SEO description (optional, ≤ 160 chars)</label>
        <textarea
          id="metaDescription"
          maxLength={160}
          value={data.metaDescription}
          onChange={(e) => set("metaDescription", e.target.value)}
        />
      </div>

      <button type="submit" className="btn" disabled={saving}>
        {saving ? "Saving..." : isEdit ? "Save changes" : "Create post"}
      </button>
    </form>
  );
}
