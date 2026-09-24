import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function AdminServicesListPage() {
  const services = await prisma.service.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <div className="admin-topbar">
        <h1 style={{ margin: 0 }}>Services</h1>
        <Link href="/admin/services/new" className="btn btn-sm">
          + New Service
        </Link>
      </div>
      <div className="card">
        {services.length === 0 ? (
          <p className="muted">No services yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id}>
                  <td>{s.title}</td>
                  <td className="muted">/{s.slug}</td>
                  <td>{s.order}</td>
                  <td>
                    <span className="badge">{s.status}</span>
                  </td>
                  <td>
                    <Link href={`/admin/services/${s.id}`} className="btn btn-sm btn-outline">
                      Edit
                    </Link>{" "}
                    <DeleteButton endpoint={`/api/admin/services/${s.id}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
