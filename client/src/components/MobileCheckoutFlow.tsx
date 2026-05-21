/**
 * Mobile Checkout Flow Component
 * Optimized checkout experience for mobile devices with step-by-step flow
 */

import { useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

interface CheckoutStep {
  id: string;
  title: string;
  description: string;
}

interface MobileCheckoutFlowProps {
  steps: CheckoutStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  children: React.ReactNode;
}

export function MobileCheckoutFlow({
  steps,
  currentStep,
  onStepChange,
  children,
}: MobileCheckoutFlowProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="w-full max-w-full">
      {/* Progress Indicator */}
      <div className="mb-6">
        {/* Step dots */}
        <div className="flex gap-2 mb-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex-1 h-1 rounded-full transition-all ${
                index < currentStep
                  ? "bg-[#4ECDC4]"
                  : index === currentStep
                  ? "bg-[#EFEFEF]"
                  : "bg-[rgba(255,255,255,0.1)]"
              }`}
            />
          ))}
        </div>

        {/* Step info */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[rgba(239,239,239,0.5)] uppercase tracking-wide">
              Passo {currentStep + 1} de {steps.length}
            </p>
            <h3 className="text-lg font-heading font-semibold text-[#EFEFEF]">
              {steps[currentStep].title}
            </h3>
            <p className="text-sm text-[rgba(239,239,239,0.6)]">
              {steps[currentStep].description}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-6 min-h-[300px]">{children}</div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 fixed bottom-0 left-0 right-0 p-4 bg-[#0B0B0B] border-t border-[rgba(255,255,255,0.1)]">
        <button
          onClick={() => onStepChange(currentStep - 1)}
          disabled={isFirstStep}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-[rgba(255,255,255,0.2)] text-[#EFEFEF] rounded hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Voltar</span>
        </button>

        <button
          onClick={() => onStepChange(currentStep + 1)}
          disabled={isLastStep}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#EFEFEF] text-[#0B0B0B] rounded hover:bg-[rgba(239,239,239,0.9)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          <span className="hidden sm:inline">{isLastStep ? "Finalizar" : "Próximo"}</span>
          <span className="sm:hidden">{isLastStep ? <Check size={16} /> : <ChevronRight size={16} />}</span>
        </button>
      </div>

      {/* Add padding to account for fixed buttons */}
      <div className="h-20" />
    </div>
  );
}
