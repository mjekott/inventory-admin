import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email").trim(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const SignUpSchema = z
  .object({
    firstname: z.string().min(1, "First name is required"),
    lastname: z.string().min(1, "Last name is required"),
  })
  .merge(loginSchema);

export type LoginSchema = z.infer<typeof loginSchema>;
export type SignUpSchema = z.infer<typeof SignUpSchema>;
