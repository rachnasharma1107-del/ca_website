import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase, hyphen-separated (e.g. my-post)");

export const serviceSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(3).max(160),
  summary: z.string().trim().min(10).max(300),
  content: z.string().trim().min(20),
  icon: z.string().trim().max(60).optional().or(z.literal("")),
  order: z.coerce.number().int().default(0),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
  metaTitle: z.string().trim().max(70).optional().or(z.literal("")),
  metaDescription: z.string().trim().max(160).optional().or(z.literal("")),
});

export const blogPostSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(3).max(160),
  excerpt: z.string().trim().min(10).max(300),
  content: z.string().trim().min(20),
  coverImage: z.string().trim().url().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  metaTitle: z.string().trim().max(70).optional().or(z.literal("")),
  metaDescription: z.string().trim().max(160).optional().or(z.literal("")),
});

export const enquiryStatusSchema = z.object({
  status: z.enum(["NEW", "IN_PROGRESS", "RESOLVED", "SPAM"]),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
export type BlogPostInput = z.infer<typeof blogPostSchema>;
