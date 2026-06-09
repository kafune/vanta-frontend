/**
 * Formulário de contato exigido pela AbacatePay antes de gerar o PIX.
 * Coleta celular e CPF/CNPJ (taxId), com máscara e validação locais.
 * Os valores são enviados como dígitos puros ao backend.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
  onlyDigits,
  maskCellphone,
  maskTaxId,
  isValidCellphone,
  isValidTaxId,
} from "@shared/br";

interface PixContactFormProps {
  defaultCellphone?: string | null;
  defaultTaxId?: string | null;
  submitting?: boolean;
  onSubmit: (data: { cellphone: string; taxId: string }) => void;
}

export function PixContactForm({
  defaultCellphone,
  defaultTaxId,
  submitting = false,
  onSubmit,
}: PixContactFormProps) {
  const [cellphone, setCellphone] = useState(maskCellphone(defaultCellphone ?? ""));
  const [taxId, setTaxId] = useState(maskTaxId(defaultTaxId ?? ""));
  const [touched, setTouched] = useState(false);

  const cellphoneValid = isValidCellphone(cellphone);
  const taxIdValid = isValidTaxId(taxId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!cellphoneValid || !taxIdValid) return;
    onSubmit({ cellphone: onlyDigits(cellphone), taxId: onlyDigits(taxId) });
  };

  const labelCls = "block text-sm text-[rgba(239,239,239,0.7)] mb-1.5";
  const errorCls = "text-xs text-[#FF6B6B] mt-1";

  return (
    <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
      <CardHeader>
        <CardTitle className="text-[#EFEFEF]">Seus dados</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-[rgba(239,239,239,0.5)] mb-4">
          Precisamos do seu celular e CPF para emitir a cobrança PIX.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="pix-cellphone" className={labelCls}>
              Celular
            </label>
            <Input
              id="pix-cellphone"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="(11) 90000-0000"
              value={cellphone}
              onChange={(e) => setCellphone(maskCellphone(e.target.value))}
              className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#EFEFEF]"
            />
            {touched && !cellphoneValid && (
              <p className={errorCls}>Informe um celular válido com DDD.</p>
            )}
          </div>

          <div>
            <label htmlFor="pix-taxid" className={labelCls}>
              CPF / CNPJ
            </label>
            <Input
              id="pix-taxid"
              inputMode="numeric"
              placeholder="000.000.000-00"
              value={taxId}
              onChange={(e) => setTaxId(maskTaxId(e.target.value))}
              className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#EFEFEF]"
            />
            {touched && !taxIdValid && (
              <p className={errorCls}>Informe um CPF ou CNPJ válido.</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#4ECDC4] text-[#0B0B0B] hover:bg-[#3BA99E]"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando PIX...
              </>
            ) : (
              "Continuar para o pagamento"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
