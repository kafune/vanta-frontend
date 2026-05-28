/**
 * Checkout Loading Overlay Component
 * Displays smooth animations and feedback during checkout login flow
 */

import { useEffect, useState } from "react";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export type LoadingState = "idle" | "loading" | "success" | "error";

interface CheckoutLoadingOverlayProps {
  state: LoadingState;
  message?: string;
  onComplete?: () => void;
}

export function CheckoutLoadingOverlay({
  state,
  message = "Processando...",
  onComplete,
}: CheckoutLoadingOverlayProps) {
  const [isVisible, setIsVisible] = useState(state !== "idle");
  const [displayMessage, setDisplayMessage] = useState(message);

  useEffect(() => {
    setIsVisible(state !== "idle");
    setDisplayMessage(message);

    if (state === "success" || state === "error") {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state, message, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center transition-all duration-500 ${
        isVisible
          ? "opacity-100 backdrop-blur-sm bg-black/40"
          : "opacity-0 pointer-events-none"
      }`}
      style={{
        zIndex: 9999,
      }}
    >
      <div
        className={`bg-[#0B0B0B] border border-[rgba(255,255,255,0.15)] rounded-lg p-8 max-w-sm w-full mx-4 transition-all duration-500 transform ${
          isVisible
            ? "scale-100 opacity-100"
            : "scale-95 opacity-0"
        }`}
      >
        {/* Loading State */}
        {state === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-16 h-16">
              {/* Outer rotating ring */}
              <div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#4ECDC4] border-r-[#4ECDC4] animate-spin"
                style={{
                  animation: "spin 1.5s linear infinite",
                }}
              />
              {/* Middle pulsing ring */}
              <div
                className="absolute inset-2 rounded-full border border-[rgba(78,205,196,0.3)] animate-pulse"
                style={{
                  animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                }}
              />
              {/* Inner dot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-2 h-2 bg-[#4ECDC4] rounded-full"
                  style={{
                    animation: "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                  }}
                />
              </div>
            </div>

            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2 text-white">
                {displayMessage}
              </h3>
              <p className="text-sm text-[rgba(239,239,239,0.6)]">
                Você será redirecionado para fazer login...
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#4ECDC4] to-[#3BA99E] rounded-full"
                style={{
                  animation: "progress 2s ease-in-out infinite",
                  width: "30%",
                }}
              />
            </div>
          </div>
        )}

        {/* Success State */}
        {state === "success" && (
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
            <div className="relative w-16 h-16">
              <div
                className="absolute inset-0 rounded-full bg-[rgba(76,205,196,0.1)] animate-pulse"
                style={{
                  animation: "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) 2",
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-[#4ECDC4] animate-bounce" />
              </div>
            </div>

            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2 text-white">
                Login Realizado!
              </h3>
              <p className="text-sm text-[rgba(239,239,239,0.6)]">
                Redirecionando para o checkout...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {state === "error" && (
          <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full bg-[rgba(255,107,107,0.1)]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <AlertCircle className="w-12 h-12 text-[#FF6B6B]" />
              </div>
            </div>

            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2 text-white">
                Erro no Login
              </h3>
              <p className="text-sm text-[rgba(239,239,239,0.6)]">
                {displayMessage}
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        @keyframes progress {
          0% {
            width: 0%;
          }
          50% {
            width: 100%;
          }
          100% {
            width: 0%;
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .animate-in {
          animation: fadeInZoom 0.3s ease-out forwards;
        }

        @keyframes fadeInZoom {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
