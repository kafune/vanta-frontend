/**
 * Checkout Authentication Guard Component
 * Ensures users are authenticated before proceeding with checkout
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Lock } from "lucide-react";
import { useState } from "react";
import { CheckoutLoadingOverlay, type LoadingState } from "./CheckoutLoadingOverlay";
import { toast } from "sonner";

interface CheckoutAuthGuardProps {
  children: React.ReactNode;
  onAuthRequired?: () => void;
}

export function CheckoutAuthGuard({ children, onAuthRequired }: CheckoutAuthGuardProps) {
  const { user, loading } = useAuth();
  const [loadingState, setLoadingState] = useState<LoadingState>("idle");

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <CheckoutLoadingOverlay
          state={loadingState}
          message="Iniciando login..."
          onComplete={() => setLoadingState("idle")}
        />
        <Card className="p-6 bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 bg-[rgba(255,165,0,0.1)] rounded-full">
                <Lock className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-lg mb-2">Autenticação Obrigatória</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Você precisa estar logado para finalizar sua compra. Faça login com sua conta VANTA para continuar.
              </p>
            </div>

            <div className="bg-[rgba(255,165,0,0.1)] border border-[rgba(255,165,0,0.2)] rounded p-3 flex gap-2 text-left mb-4">
              <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-600">
                Ao fazer login, você terá acesso a histórico de pedidos, rastreamento em tempo real e ofertas exclusivas.
              </p>
            </div>

            <Button
              onClick={() => {
                setLoadingState("loading");
                toast.loading("Iniciando login...");
                onAuthRequired?.();
                
                // Simulate login process with smooth transitions
                setTimeout(() => {
                  setLoadingState("success");
                  toast.success("Login iniciado com sucesso!");
                  
                  // Redirect after showing success state
                  setTimeout(() => {
                    window.location.href = getLoginUrl();
                  }, 1000);
                }, 1500);
              }}
              disabled={loadingState === "loading"}
              className="w-full bg-[#4ECDC4] text-[#0B0B0B] hover:bg-[#3BA99E] font-semibold disabled:opacity-50 transition-all"
            >
              {loadingState === "loading" ? "Conectando..." : "🔐 Fazer Login para Comprar"}
            </Button>

            <p className="text-xs text-muted-foreground">
              Não tem conta? Crie uma gratuitamente durante o login.
            </p>
          </div>
        </Card>
      </>
    );
  }

  return (
    <>
      <CheckoutLoadingOverlay
        state={loadingState}
        message="Processando checkout..."
        onComplete={() => setLoadingState("idle")}
      />
      {children}
    </>
  );
}
