import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function AdminBlogListPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="admin-topbar">
        <h1 style={{ margin: 0 }}>Blog Posts</h1>
        <Link href="/admin/blog/new" className="btn btn-sm">
          + New Post
        </Link>
      </div>
      <div className="card">
        {posts.length === 0 ? (
          <p className="muted">No blog posts yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>{post.title}</td>
                  <td className="muted">/{post.slug}</td>
                  <td>
                    <span className="badge">{post.status}</span>
                  </td>
                  <td>{post.updatedAt.toLocaleDateString("en-IN")}</td>
                  <td>
                    <Link href={`/admin/blog/${post.id}`} className="btn btn-sm btn-outline">
                      Edit
                    </Link>{" "}
                    <DeleteButton endpoint={`/api/admin/blog/${post.id}`} />
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
