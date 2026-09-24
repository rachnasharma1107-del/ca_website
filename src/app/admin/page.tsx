import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { enquiryBadgeClass } from "@/lib/ui";

export default async function AdminDashboardPage() {
  const [newEnquiries, totalEnquiries, publishedServices, publishedPosts, draftPosts] =
    await Promise.all([
      prisma.enquiry.count({ where: { status: "NEW" } }),
      prisma.enquiry.count(),
      prisma.service.count({ where: { status: "PUBLISHED" } }),
      prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
      prisma.blogPost.count({ where: { status: "DRAFT" } }),
    ]);

  const recentEnquiries = await prisma.enquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="grid" style={{ marginBottom: 32 }}>
        <div className="card">
          <div className="muted">New enquiries</div>
          <h2 style={{ margin: 0 }}>{newEnquiries}</h2>
        </div>
        <div className="card">
          <div className="muted">Total enquiries</div>
          <h2 style={{ margin: 0 }}>{totalEnquiries}</h2>
        </div>
        <div className="card">
          <div className="muted">Published services</div>
          <h2 style={{ margin: 0 }}>{publishedServices}</h2>
        </div>
        <div className="card">
          <div className="muted">Blog posts (published / draft)</div>
          <h2 style={{ margin: 0 }}>
            {publishedPosts} / {draftPosts}
          </h2>
        </div>
      </div>

      <div className="card">
        <div className="admin-topbar" style={{ marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Recent enquiries</h3>
          <Link href="/admin/enquiries">View all →</Link>
        </div>
        {recentEnquiries.length === 0 ? (
          <p className="muted">No enquiries yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Received</th>
              </tr>
            </thead>
            <tbody>
              {recentEnquiries.map((e) => (
                <tr key={e.id}>
                  <td>{e.name}</td>
                  <td>{e.email}</td>
                  <td>{e.subject || "—"}</td>
                  <td>
                    <span className={enquiryBadgeClass(e.status)}>{e.status}</span>
                  </td>
                  <td>{e.createdAt.toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
