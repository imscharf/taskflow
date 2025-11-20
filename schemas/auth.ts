// taskflow/schemas/auth.ts
import { z } from "zod";

// Esquema para o formulário de Cadastro
export const signupSchema = z.object({
  email: z.string().email("Email inválido."),
  password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres."),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"], // Indica qual campo gerou o erro
});

// Esquema para o formulário de Login
export const loginSchema = z.object({
  email: z.string().email("Email inválido."),
  password: z.string().min(1, "A senha é obrigatória."),
});

// Nota sobre senha forte: O Firebase Authentication já tem algumas regras
// para senhas (mínimo de 6 caracteres). Podemos adicionar mais complexidade
// no Zod se necessário (e.g., regex para maiúsculas, minúsculas, números, símbolos).
// Por enquanto, o mínimo de 8 caracteres é um bom começo.