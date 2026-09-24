/** Serializes a value for embedding inside a <script type="application/ld+json"> tag,
 * escaping "<" to prevent premature </script> closure from user-controlled content. */
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
