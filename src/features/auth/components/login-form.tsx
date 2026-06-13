"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { loginSchema, type LoginInput } from "@/features/auth/schemas";
import { login } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/admin";
  const initialError =
    searchParams.get("error") === "no_access"
      ? "Tu cuenta no tiene acceso al panel."
      : null;

  const [serverError, setServerError] = useState<string | null>(initialError);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    const result = await login(values);
    // login() redirects on success; if it returns, it failed.
    if (result && !result.ok) {
      setServerError(result.error);
      return;
    }
    router.push(redirectTo);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label htmlFor="username" className="mb-1.5 block text-sm font-medium">
          Usuario
        </label>
        <Input
          id="username"
          type="text"
          autoComplete="username"
          placeholder="yienkid"
          aria-invalid={!!errors.username}
          {...register("username")}
        />
        {errors.username && (
          <p className="mt-1 text-xs text-destructive">
            {errors.username.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          Contraseña
        </label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <p className="mt-1 text-xs text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      {serverError && (
        <p className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {serverError}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Ingresando…
          </>
        ) : (
          <>
            <LogIn className="h-5 w-5" /> Ingresar
          </>
        )}
      </Button>
    </form>
  );
}
