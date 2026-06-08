/**
 * Página de login/cadastro local (email + senha).
 * Usa trpc.auth.login / auth.register e redireciona conforme o papel.
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type Mode = "login" | "register";

export default function Login() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const afterAuth = async (user: { role: string }) => {
    await utils.auth.me.invalidate();
    setLocation(user.role === "admin" ? "/admin" : "/");
  };

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: afterAuth,
    onError: (e) => toast.error("Não foi possível entrar", { description: e.message }),
  });
  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (user) => {
      toast.success("Conta criada!");
      void afterAuth(user);
    },
    onError: (e) => toast.error("Não foi possível criar a conta", { description: e.message }),
  });

  const isPending = loginMutation.isPending || registerMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      loginMutation.mutate({ email, password });
    } else {
      registerMutation.mutate({ name, email, password });
    }
  };

  const inputClass =
    "w-full h-11 px-4 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.15)] text-[#EFEFEF] font-heading text-sm focus:outline-none focus:border-[rgba(255,255,255,0.4)] transition-colors";

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <h1 className="font-display text-4xl text-[#EFEFEF] mb-2">
        {mode === "login" ? "Entrar" : "Criar conta"}
      </h1>
      <p className="font-heading text-sm text-[rgba(239,239,239,0.5)] mb-8">
        {mode === "login"
          ? "Acesse sua conta para continuar."
          : "Crie sua conta para finalizar pedidos."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <div>
            <label className="font-heading text-xs text-[rgba(239,239,239,0.6)] block mb-2">Nome</label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
        )}
        <div>
          <label className="font-heading text-xs text-[rgba(239,239,239,0.6)] block mb-2">Email</label>
          <input
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div>
          <label className="font-heading text-xs text-[rgba(239,239,239,0.6)] block mb-2">Senha</label>
          <input
            type="password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            minLength={mode === "register" ? 8 : undefined}
          />
        </div>

        <button type="submit" disabled={isPending} className="btn-cta w-full py-3.5 flex items-center justify-center gap-2">
          {isPending && <Loader2 size={16} className="animate-spin" />}
          <span>{mode === "login" ? "Entrar" : "Criar conta"}</span>
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="font-heading text-sm text-[rgba(239,239,239,0.5)] hover:text-[#EFEFEF] transition-colors"
        >
          {mode === "login" ? "Não tem conta? Criar conta" : "Já tem conta? Entrar"}
        </button>
      </div>
    </div>
  );
}
