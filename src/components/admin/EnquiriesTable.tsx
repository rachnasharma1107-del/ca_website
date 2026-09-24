"use client";

import { Fragment, useEffect, useState, useCallback } from "react";

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  serviceSlug: string | null;
  status: "NEW" | "IN_PROGRESS" | "RESOLVED" | "SPAM";
  createdAt: string;
}

const STATUS_OPTIONS: Enquiry["status"][] = ["NEW", "IN_PROGRESS", "RESOLVED", "SPAM"];

function badgeClass(status: Enquiry["status"]) {
  const map: Record<Enquiry["status"], string> = {
    NEW: "badge badge-new",
    IN_PROGRESS: "badge badge-progress",
    RESOLVED: "badge badge-resolved",
    SPAM: "badge badge-spam",
  };
  return map[status] ?? "badge";
}

export default function EnquiriesTable() {
  const [items, setItems] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = filter ? `/api/admin/enquiries?status=${filter}` : "/api/admin/enquiries";
      const res = await fetch(url);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to load enquiries.");
      setItems(body.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load enquiries.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: string, status: Enquiry["status"]) {
    const res = await fetch(`/api/admin/enquiries/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, status } : it)));
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this enquiry? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/enquiries/${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((it) => it.id !== id));
  }

  return (
    <div className="card">
      <div className="admin-topbar">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button className="btn btn-sm btn-outline" onClick={load}>
          Refresh
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p className="muted">Loading...</p>}

      {!loading && items.length === 0 && <p className="muted">No enquiries found.</p>}

      {!loading && items.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Received</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((e) => (
              <Fragment key={e.id}>
                <tr>
                  <td>{e.name}</td>
                  <td>
                    {e.email}
                    {e.phone ? ` · ${e.phone}` : ""}
                  </td>
                  <td>{e.subject || "—"}</td>
                  <td>
                    <span className={badgeClass(e.status)}>{e.status}</span>
                  </td>
                  <td>{new Date(e.createdAt).toLocaleDateString("en-IN")}</td>
                  <td>
                    <select
                      value={e.status}
                      onChange={(ev) => updateStatus(e.id, ev.target.value as Enquiry["status"])}
                      style={{ marginRight: 8 }}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => setExpandedId(expandedId === e.id ? null : e.id)}
                    >
                      {expandedId === e.id ? "Hide" : "View"}
                    </button>{" "}
                    <button className="btn btn-sm btn-danger" onClick={() => remove(e.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
                {expandedId === e.id && (
                  <tr>
                    <td colSpan={6} style={{ background: "#f9fafb" }}>
                      <strong>Message:</strong>
                      <p style={{ whiteSpace: "pre-wrap", margin: "8px 0 0" }}>{e.message}</p>
                      {e.serviceSlug && (
                        <p className="muted" style={{ marginTop: 8 }}>
                          Related service: {e.serviceSlug}
                        </p>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
