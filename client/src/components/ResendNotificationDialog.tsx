/**
 * ResendNotificationDialog Component
 * Dialog for resending order notifications with optional custom message
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ResendNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  customerEmail?: string;
  orderStatus?: string;
  onSuccess?: () => void;
}

export function ResendNotificationDialog({
  open,
  onOpenChange,
  orderId,
  customerEmail,
  orderStatus,
  onSuccess,
}: ResendNotificationDialogProps) {
  const [customMessage, setCustomMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const resendMutation = trpc.notifications.resendNotification.useMutation();

  const handleResend = async () => {
    if (!orderId) {
      toast.error("ID do pedido não encontrado");
      return;
    }

    setIsLoading(true);
    try {
      const result = await resendMutation.mutateAsync({
        orderId,
        customMessage: customMessage.trim() || undefined,
      });

      if (result.success) {
        toast.success(result.message);
        setCustomMessage("");
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.message || "Erro ao reenviar notificação");
      }
    } catch (error) {
      console.error("Error resending notification:", error);
      toast.error("Erro ao reenviar notificação");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a1a] border-[rgba(255,255,255,0.1)] text-[#EFEFEF] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#EFEFEF]">
            <Mail className="w-5 h-5" />
            Reenviar Notificação
          </DialogTitle>
          <DialogDescription className="text-[rgba(239,239,239,0.6)]">
            Reenvie a notificação de status do pedido para o cliente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Order ID */}
          <div className="space-y-2">
            <Label className="text-[rgba(239,239,239,0.7)]">ID do Pedido</Label>
            <Input
              value={orderId.slice(0, 12) + "..."}
              disabled
              className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[rgba(239,239,239,0.5)]"
            />
          </div>

          {/* Customer Email */}
          {customerEmail && (
            <div className="space-y-2">
              <Label className="text-[rgba(239,239,239,0.7)]">Email do Cliente</Label>
              <Input
                value={customerEmail}
                disabled
                className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[rgba(239,239,239,0.5)]"
              />
            </div>
          )}

          {/* Order Status */}
          {orderStatus && (
            <div className="space-y-2">
              <Label className="text-[rgba(239,239,239,0.7)]">Status do Pedido</Label>
              <Input
                value={orderStatus}
                disabled
                className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[rgba(239,239,239,0.5)]"
              />
            </div>
          )}

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="custom-message" className="text-[rgba(239,239,239,0.7)]">
              Mensagem Personalizada (Opcional)
            </Label>
            <Textarea
              id="custom-message"
              placeholder="Digite uma mensagem customizada para incluir no email..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#EFEFEF] placeholder-[rgba(239,239,239,0.3)] min-h-24 resize-none"
              maxLength={500}
            />
            <p className="text-xs text-[rgba(239,239,239,0.4)]">
              {customMessage.length}/500 caracteres
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3">
            <p className="text-xs text-blue-300">
              ℹ️ A notificação será reenviada com o status atual do pedido. Um registro será criado no histórico de emails.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="border-[rgba(255,255,255,0.1)] text-[rgba(239,239,239,0.7)]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleResend}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Reenviando...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Reenviar Notificação
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
