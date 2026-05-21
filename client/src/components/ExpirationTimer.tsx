/**
 * Expiration Timer Component
 * Display countdown timer with visual progress bar
 */

import { useEffect, useState } from "react";
import { AlertCircle, Clock } from "lucide-react";

interface ExpirationTimerProps {
  expiresAt: Date;
  onExpired?: () => void;
  onWarning?: (minutesRemaining: number) => void;
  warningThreshold?: number; // minutes before expiration to show warning
}

export function ExpirationTimer({
  expiresAt,
  onExpired,
  onWarning,
  warningThreshold = 5,
}: ExpirationTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const [hasWarned, setHasWarned] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining(0);
        setIsExpired(true);
        if (!isExpired) {
          onExpired?.();
        }
      } else {
        setTimeRemaining(diff);
        const minutesRemaining = Math.floor(diff / 60000);

        if (minutesRemaining <= warningThreshold && !hasWarned) {
          setIsWarning(true);
          setHasWarned(true);
          onWarning?.(minutesRemaining);
        } else if (minutesRemaining > warningThreshold) {
          setIsWarning(false);
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpired, onWarning, warningThreshold, isExpired, hasWarned]);

  const totalTime = expiresAt.getTime() - new Date(expiresAt.getTime() - 30 * 60 * 1000).getTime();
  const progressPercent = Math.max(0, (timeRemaining / totalTime) * 100);

  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);

  // Determine color based on time remaining
  let bgColor = "bg-[#4ECDC4]"; // Green - plenty of time
  let textColor = "text-[#4ECDC4]";
  let borderColor = "border-[#4ECDC4]";

  if (isExpired) {
    bgColor = "bg-[#FF6B6B]";
    textColor = "text-[#FF6B6B]";
    borderColor = "border-[#FF6B6B]";
  } else if (isWarning) {
    bgColor = "bg-[#FFD93D]";
    textColor = "text-[#FFD93D]";
    borderColor = "border-[#FFD93D]";
  }

  return (
    <div className={`space-y-3 p-4 rounded-lg border-2 ${borderColor} bg-[rgba(255,255,255,0.02)]`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${textColor}`} />
          <span className={`text-sm font-semibold ${textColor}`}>
            {isExpired ? "PIX Expirado" : "Expira em"}
          </span>
        </div>
        <span className={`font-mono text-lg font-bold ${textColor}`}>
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[rgba(255,255,255,0.1)] rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${bgColor} transition-all duration-1000 ease-linear`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Warning Message */}
      {isWarning && !isExpired && (
        <div className="flex items-start gap-2 bg-[rgba(255,217,61,0.1)] border border-[#FFD93D] rounded p-2">
          <AlertCircle className="w-4 h-4 text-[#FFD93D] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#FFD93D]">
            Este PIX expira em breve. Realize o pagamento antes do tempo acabar.
          </p>
        </div>
      )}

      {/* Expired Message */}
      {isExpired && (
        <div className="flex items-start gap-2 bg-[rgba(255,107,107,0.1)] border border-[#FF6B6B] rounded p-2">
          <AlertCircle className="w-4 h-4 text-[#FF6B6B] flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[#FF6B6B]">
            Este PIX expirou. Gere um novo para continuar o pagamento.
          </p>
        </div>
      )}

      {/* Time Breakdown */}
      <div className="text-xs text-[rgba(239,239,239,0.5)] space-y-1">
        <p>Tempo restante: {minutes} minuto{minutes !== 1 ? "s" : ""} e {seconds} segundo{seconds !== 1 ? "s" : ""}</p>
        <p>Válido até: {expiresAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p>
      </div>
    </div>
  );
}
