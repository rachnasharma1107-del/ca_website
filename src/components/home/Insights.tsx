import Link from "next/link";
import styles from "./Insights.module.css";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: Date | null;
};

export default function Insights({ posts }: { posts: Post[] }) {
  return (
    <section className={styles.root} aria-labelledby="insights-heading">
      <div className={styles.container}>
        <header className={styles.heading}>
          <div>
            <p className={styles.kicker}>Insights</p>
            <h2 id="insights-heading">Thinking beyond<br />the numbers.</h2>
            <p className={styles.intro}>Timely perspectives on regulation, finance and the decisions shaping your business.</p>
            <Link href="/blog" className={styles.allLink}>All insights <span>→</span></Link>
          </div>
        </header>

        <div className={styles.posts}>
          {posts.map((post, index) => (
            <article className={styles.post} key={post.id}>
              <div className={styles.meta}>
                <span>0{index + 1}</span>
                {post.publishedAt && <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>}
              </div>
              <div className={styles.postBody}>
                <h3><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3>
                <p>{post.excerpt}</p>
              </div>
              <Link href={`/blog/${post.slug}`} className={styles.readLink} aria-label={`Read ${post.title}`}><span>Read</span> →</Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}
