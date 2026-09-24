import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  subject: z.string().trim().max(150).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Message is too short").max(5000),
  serviceSlug: z.string().trim().max(150).optional().or(z.literal("")),
  // Honeypot field — real users never fill this in (it's hidden); bots
  // often do. Field name is deliberately unlike autofill categories like
  // "website"/"url" so browsers won't auto-populate it for real users.
  // Not hard-validated with max(0) here — spam detection happens in the
  // route handler instead, so a stray autofill can never hard-reject a
  // genuine submission.
  hp_confirm_no_fill: z.string().optional().default(""),
});

export type ContactInput = z.infer<typeof contactSchema>;
