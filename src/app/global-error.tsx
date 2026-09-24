"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <section className="section">
          <div className="container" style={{ textAlign: "center" }}>
            <h1>Something went wrong</h1>
            <p className="lede">We're sorry — an unexpected error occurred.</p>
            <button className="btn" onClick={reset}>
              Try again
            </button>
          </div>
        </section>
      </body>
    </html>
  );
}
