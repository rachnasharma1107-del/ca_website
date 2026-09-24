/** Turns an API's `{ error, issues }` response (zod flatten().fieldErrors shape)
 * into one readable string, e.g. "excerpt: Excerpt is too short; content: ...". */
export function formatApiError(body: {
  error?: string;
  issues?: Record<string, string[] | undefined>;
}): string {
  if (body.issues) {
    const parts = Object.entries(body.issues)
      .filter(([, messages]) => messages && messages.length > 0)
      .map(([field, messages]) => `${field}: ${messages![0]}`);
    if (parts.length > 0) {
      return `${body.error ?? "Validation failed."} (${parts.join("; ")})`;
    }
  }
  return body.error || "Something went wrong. Please try again.";
}
