"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "../../schemas/auth";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { toast } from "sonner";

type SignUpFormInputs = z.infer<typeof signupSchema>;

export function SignUpForm() {
  const { signup } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignUpFormInputs>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignUpFormInputs) => {
    setLoading(true);
    setError(null);
    try {
      await signup(data.email, data.password);
      toast.success("Cadastro realizado com sucesso! Faça login para continuar.");
      reset();
    } catch (err: any) {
      console.error("Erro no cadastro:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("Este email já está em uso.");
      } else if (err.code === "auth/weak-password") {
        setError("A senha é muito fraca.");
      } else {
        setError("Erro ao cadastrar. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-xl shadow-xl bg-card border border-border">
      <h2 className="text-3xl font-bold mb-6 text-center text-foreground">Cadastrar</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">Email</label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            placeholder="seu@email.com"
          />
          {errors.email && <p className="mt-1 text-sm text-destructive font-medium">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">Senha</label>
          <input
            id="password"
            type="password"
            {...register("password")}
            className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            placeholder="Mínimo 8 caracteres"
          />
          {errors.password && <p className="mt-1 text-sm text-destructive font-medium">{errors.password.message}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-1">Confirmar Senha</label>
          <input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
            className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            placeholder="Repita a senha"
          />
          {errors.confirmPassword && <p className="mt-1 text-sm text-destructive font-medium">{errors.confirmPassword.message}</p>}
        </div>

        {error && <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm text-center font-medium">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md"
        >
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>
      
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem uma conta? <a href="/login" className="font-semibold text-primary hover:underline">Faça login</a>
      </p>
    </div>
  );
}