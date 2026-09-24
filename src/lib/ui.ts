import type { EnquiryStatus } from "@prisma/client";

const map: Record<EnquiryStatus, string> = {
  NEW: "badge badge-new",
  IN_PROGRESS: "badge badge-progress",
  RESOLVED: "badge badge-resolved",
  SPAM: "badge badge-spam",
};

export function enquiryBadgeClass(status: EnquiryStatus): string {
  return map[status] ?? "badge";
}
