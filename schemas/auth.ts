import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."), // Novo campo
  email: z.string().email("Email inválido."),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("Email inválido."),
  password: z.string().min(1, "A senha é obrigatória."),
});