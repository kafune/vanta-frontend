/**
 * PIX Checkout Component
 * Display PIX QR Code and payment details with expiration timer
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExpirationTimer } from "./ExpirationTimer";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Copy, Check, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { CheckoutAuthGuard } from "./CheckoutAuthGuard";
import { getLoginUrl } from "@/const";

interface PixCheckoutProps {
  orderId: string;
  amount: number; // in cents
  onPaymentConfirmed?: () => void;
  onCancel?: () => void;
}

export function PixCheckout({ orderId, amount, onPaymentConfirmed, onCancel }: PixCheckoutProps) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // Require authentication for PIX checkout
  if (!user) {
    return (
      <CheckoutAuthGuard
        onAuthRequired={() => {
          // Redirect to login with return path
          window.location.href = getLoginUrl();
        }}
      >
        <div />
      </CheckoutAuthGuard>
    );
  }

  // Generate PIX payment
  const generatePayment = trpc.pix.generatePayment.useMutation({
    onSuccess: (data) => {
      toast.success("PIX gerado com sucesso!");
      setIsExpired(false);
    },
    onError: (error) => {
      toast.error(`Erro ao gerar PIX: ${error.message}`);
    },
  });

  // Confirm payment (simulated)
  const confirmPayment = trpc.pix.confirmPayment.useMutation({
    onSuccess: () => {
      setPaymentConfirmed(true);
      toast.success("Pagamento confirmado!");
      onPaymentConfirmed?.();
    },
    onError: (error) => {
      toast.error(`Erro ao confirmar pagamento: ${error.message}`);
    },
  });

  // Generate PIX on mount
  useEffect(() => {
    if (!generatePayment.data) {
      generatePayment.mutate({
        orderId,
        amount,
        description: "Compra VANTA",
      });
    }
  }, [orderId, amount]);

  const pixData = generatePayment.data;
  const amountFormatted = (amount / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  if (generatePayment.isPending) {
    return (
      <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
        <CardContent className="pt-6 flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#4ECDC4]" />
          <span className="ml-3 text-[rgba(239,239,239,0.6)]">Gerando PIX...</span>
        </CardContent>
      </Card>
    );
  }

  if (!pixData) {
    return (
      <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-[#FF6B6B]">
            <AlertCircle className="w-5 h-5" />
            <span>Erro ao gerar PIX. Tente novamente.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (paymentConfirmed) {
    return (
      <Card className="bg-[rgba(76,205,196,0.1)] border-[#4ECDC4]">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <Check className="w-12 h-12 text-[#4ECDC4]" />
            </div>
            <h3 className="text-lg font-semibold text-[#4ECDC4] mb-2">Pagamento Confirmado!</h3>
            <p className="text-[rgba(239,239,239,0.6)] mb-4">
              Seu pedido foi recebido e será processado em breve.
            </p>
            <Button onClick={onPaymentConfirmed} className="bg-[#4ECDC4] text-[#0B0B0B] hover:bg-[#3BA99E]">
              Continuar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Amount */}
      <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
        <CardHeader>
          <CardTitle className="text-[#EFEFEF]">Valor a Pagar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-[#4ECDC4]">{amountFormatted}</div>
        </CardContent>
      </Card>

      {/* Expiration Timer */}
      {!isExpired && (
        <ExpirationTimer
          expiresAt={new Date(pixData.expiresAt)}
          onExpired={() => {
            setIsExpired(true);
            toast.error("PIX expirado! Gere um novo para continuar.");
          }}
          onWarning={(minutesRemaining) => {
            if (minutesRemaining <= 5) {
              toast.warning(`PIX expira em ${minutesRemaining} minuto${minutesRemaining !== 1 ? "s" : ""}!`);
            }
          }}
          warningThreshold={5}
        />
      )}

      {/* Expired Message */}
      {isExpired && (
        <Card className="bg-[rgba(255,107,107,0.1)] border-[#FF6B6B]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-[#FF6B6B] mb-4">
              <AlertCircle className="w-5 h-5" />
              <span>Este PIX expirou. Gere um novo para continuar.</span>
            </div>
            <Button
              onClick={() => {
                generatePayment.mutate({
                  orderId,
                  amount,
                  description: "Compra VANTA",
                });
              }}
              disabled={generatePayment.isPending}
              className="w-full bg-[#4ECDC4] text-[#0B0B0B] hover:bg-[#3BA99E]"
            >
              {generatePayment.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando novo PIX...
                </>
              ) : (
                "Gerar Novo PIX"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* PIX Key (telefone) */}
      {!isExpired && (
        <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
          <CardHeader>
            <CardTitle className="text-[#EFEFEF]">Chave PIX</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-xs text-[rgba(239,239,239,0.5)] mb-2">Telefone para transferência via PIX:</p>
              <div className="flex items-center gap-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg p-3">
                <code className="flex-1 text-base text-[#EFEFEF] break-all font-mono">{pixData.pixKey}</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(pixData.pixKey);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                    toast.success("Chave PIX copiada!");
                  }}
                  className="text-[#4ECDC4] hover:bg-[rgba(78,205,196,0.1)]"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {!isExpired && (
        <div className="flex gap-3">
          <Button
            onClick={() => {
              setConfirmingPayment(true);
              confirmPayment.mutate({ paymentId: pixData.paymentId });
            }}
            disabled={confirmingPayment || confirmPayment.isPending}
            className="flex-1 bg-[#4ECDC4] text-[#0B0B0B] hover:bg-[#3BA99E]"
          >
            {confirmingPayment || confirmPayment.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Confirmando...
              </>
            ) : (
              "Confirmar Pagamento"
            )}
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="border-[rgba(255,255,255,0.1)] text-[#EFEFEF]"
          >
            Cancelar
          </Button>
        </div>
      )}

      {/* Instructions */}
      {!isExpired && (
        <Card className="bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.05)]">
          <CardHeader>
            <CardTitle className="text-sm text-[#EFEFEF]">Como Pagar</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[rgba(239,239,239,0.6)] space-y-2">
            <p>1. Abra o aplicativo do seu banco</p>
            <p>2. Selecione a opção "Pagar com PIX" usando chave</p>
            <p>3. Informe a chave PIX (telefone) acima e o valor</p>
            <p>4. Confirme o pagamento no seu banco</p>
            <p>5. Clique em "Confirmar Pagamento" aqui após a conclusão</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
