"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { formatApiError } from "@/lib/format-api-error";

interface ServiceData {
  id?: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  icon: string;
  order: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  metaTitle: string;
  metaDescription: string;
}

const empty: ServiceData = {
  slug: "",
  title: "",
  summary: "",
  content: "",
  icon: "",
  order: 0,
  status: "PUBLISHED",
  metaTitle: "",
  metaDescription: "",
};

export default function ServiceForm({ initial }: { initial?: ServiceData }) {
  const router = useRouter();
  const [data, setData] = useState<ServiceData>(initial ?? empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(initial?.id);

  function set<K extends keyof ServiceData>(key: K, value: ServiceData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const endpoint = isEdit ? `/api/admin/services/${initial!.id}` : "/api/admin/services";
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

      router.push("/admin/services");
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
        <input id="title" required value={data.title} onChange={(e) => set("title", e.target.value)} />
      </div>

      <div className="form-field">
        <label htmlFor="slug">Slug (URL path)</label>
        <input
          id="slug"
          required
          value={data.slug}
          onChange={(e) => set("slug", e.target.value)}
          placeholder="e.g. audit-assurance"
        />
      </div>

      <div className="form-field">
        <label htmlFor="summary">Summary (short — used in listings)</label>
        <textarea id="summary" required value={data.summary} onChange={(e) => set("summary", e.target.value)} />
      </div>

      <div className="form-field">
        <label htmlFor="content">Full description</label>
        <textarea
          id="content"
          required
          style={{ minHeight: 200 }}
          value={data.content}
          onChange={(e) => set("content", e.target.value)}
        />
      </div>

      <div className="form-field">
        <label htmlFor="order">Display order</label>
        <input
          id="order"
          type="number"
          value={data.order}
          onChange={(e) => set("order", Number(e.target.value))}
        />
      </div>

      <div className="form-field">
        <label htmlFor="status">Status</label>
        <select id="status" value={data.status} onChange={(e) => set("status", e.target.value as ServiceData["status"])}>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <div className="form-field">
        <label htmlFor="metaTitle">SEO title (optional, ≤ 70 chars)</label>
        <input id="metaTitle" maxLength={70} value={data.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} />
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
        {saving ? "Saving..." : isEdit ? "Save changes" : "Create service"}
      </button>
    </form>
  );
}
