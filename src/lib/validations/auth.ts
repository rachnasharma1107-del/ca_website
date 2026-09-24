import { z } from "zod";

export const otpRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
});

export const otpVerifySchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  code: z
    .string()
    .trim()
    .regex(/^\d{4,10}$/, "Enter the code exactly as received"),
});

export type OtpRequestInput = z.infer<typeof otpRequestSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
