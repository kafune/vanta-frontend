/**
 * Clothing Model SVG Generators
 * Generates SVG mockups for different clothing models
 */

import { ClothingModel } from "@/components/ModelSelector";

export const getClothingSVG = (model: ClothingModel, color: string): string => {
  switch (model) {
    case "regular-shirt":
      return getRegularShirtSVG(color);
    case "oversized-shirt":
      return getOversizedShirtSVG(color);
    case "long-sleeve":
      return getLongSleeveSVG(color);
    case "tank-top":
      return getTankTopSVG(color);
    case "regular-hoodie":
      return getRegularHoodieSVG(color);
    case "oversized-hoodie":
      return getOversizedHoodieSVG(color);
    case "sweatshirt":
      return getSweatshirtSVG(color);
    default:
      return getRegularShirtSVG(color);
  }
};

// Regular T-Shirt
const getRegularShirtSVG = (color: string) => `
<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" fill="none">
  <!-- Body -->
  <path d="M 120 50 L 50 110 L 80 140 L 80 450 L 320 450 L 320 140 L 350 110 L 280 50 C 260 70 230 80 200 80 C 170 80 140 70 120 50 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
  <!-- Left sleeve -->
  <path d="M 120 50 L 50 110 L 80 140 L 130 90 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.15)" stroke-width="1" opacity="0.95"/>
  <!-- Right sleeve -->
  <path d="M 280 50 L 350 110 L 320 140 L 270 90 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.15)" stroke-width="1" opacity="0.95"/>
  <!-- Collar -->
  <path d="M 120 50 C 140 70 170 80 200 80 C 230 80 260 70 280 50" 
    fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2.5"/>
  <!-- Print area guide -->
  <rect x="140" y="150" width="120" height="140" rx="3" 
    fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" stroke-dasharray="8,4"/>
</svg>
`;

// Oversized T-Shirt
const getOversizedShirtSVG = (color: string) => `
<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" fill="none">
  <!-- Body - wider -->
  <path d="M 80 60 L 20 120 L 50 150 L 50 450 L 350 450 L 350 150 L 380 120 L 320 60 C 300 80 250 90 200 90 C 150 90 100 80 80 60 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
  <!-- Left sleeve - longer -->
  <path d="M 80 60 L 20 120 L 50 150 L 100 80 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.15)" stroke-width="1" opacity="0.95"/>
  <!-- Right sleeve - longer -->
  <path d="M 320 60 L 380 120 L 350 150 L 300 80 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.15)" stroke-width="1" opacity="0.95"/>
  <!-- Collar -->
  <path d="M 80 60 C 100 80 150 90 200 90 C 250 90 300 80 320 60" 
    fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2.5"/>
  <!-- Print area guide -->
  <rect x="130" y="160" width="140" height="160" rx="3" 
    fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" stroke-dasharray="8,4"/>
</svg>
`;

// Long Sleeve
const getLongSleeveSVG = (color: string) => `
<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" fill="none">
  <!-- Body -->
  <path d="M 120 50 L 50 110 L 80 140 L 80 450 L 320 450 L 320 140 L 350 110 L 280 50 C 260 70 230 80 200 80 C 170 80 140 70 120 50 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
  <!-- Left sleeve - long -->
  <path d="M 120 50 L 30 110 L 60 140 L 80 140 L 130 90 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.15)" stroke-width="1" opacity="0.95"/>
  <!-- Right sleeve - long -->
  <path d="M 280 50 L 370 110 L 340 140 L 320 140 L 270 90 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.15)" stroke-width="1" opacity="0.95"/>
  <!-- Collar -->
  <path d="M 120 50 C 140 70 170 80 200 80 C 230 80 260 70 280 50" 
    fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2.5"/>
  <!-- Print area guide -->
  <rect x="140" y="150" width="120" height="140" rx="3" 
    fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" stroke-dasharray="8,4"/>
</svg>
`;

// Tank Top
const getTankTopSVG = (color: string) => `
<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" fill="none">
  <!-- Body - no sleeves -->
  <path d="M 140 50 L 140 140 L 80 450 L 320 450 L 260 140 L 260 50 C 250 60 220 70 200 70 C 180 70 150 60 140 50 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
  <!-- Collar -->
  <path d="M 140 50 C 150 60 180 70 200 70 C 220 70 250 60 260 50" 
    fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2.5"/>
  <!-- Print area guide -->
  <rect x="140" y="150" width="120" height="160" rx="3" 
    fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" stroke-dasharray="8,4"/>
</svg>
`;

// Regular Hoodie
const getRegularHoodieSVG = (color: string) => `
<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" fill="none">
  <!-- Body -->
  <path d="M 120 80 L 50 140 L 80 170 L 80 450 L 320 450 L 320 170 L 350 140 L 280 80 C 260 100 230 110 200 110 C 170 110 140 100 120 80 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
  <!-- Left sleeve -->
  <path d="M 120 80 L 50 140 L 80 170 L 130 110 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.15)" stroke-width="1" opacity="0.95"/>
  <!-- Right sleeve -->
  <path d="M 280 80 L 350 140 L 320 170 L 270 110 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.15)" stroke-width="1" opacity="0.95"/>
  <!-- Hood -->
  <path d="M 140 80 Q 200 20 260 80" 
    fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
  <!-- Drawstring -->
  <line x1="180" y1="100" x2="220" y2="100" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
  <!-- Print area guide -->
  <rect x="140" y="180" width="120" height="140" rx="3" 
    fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" stroke-dasharray="8,4"/>
</svg>
`;

// Oversized Hoodie
const getOversizedHoodieSVG = (color: string) => `
<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" fill="none">
  <!-- Body - wider -->
  <path d="M 80 90 L 20 150 L 50 180 L 50 450 L 350 450 L 350 180 L 380 150 L 320 90 C 300 110 250 120 200 120 C 150 120 100 110 80 90 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
  <!-- Left sleeve - longer -->
  <path d="M 80 90 L 20 150 L 50 180 L 100 110 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.15)" stroke-width="1" opacity="0.95"/>
  <!-- Right sleeve - longer -->
  <path d="M 320 90 L 380 150 L 350 180 L 300 110 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.15)" stroke-width="1" opacity="0.95"/>
  <!-- Hood - larger -->
  <path d="M 120 90 Q 200 10 280 90" 
    fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
  <!-- Drawstring -->
  <line x1="160" y1="110" x2="240" y2="110" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
  <!-- Print area guide -->
  <rect x="130" y="190" width="140" height="160" rx="3" 
    fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" stroke-dasharray="8,4"/>
</svg>
`;

// Sweatshirt
const getSweatshirtSVG = (color: string) => `
<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" fill="none">
  <!-- Body -->
  <path d="M 110 50 L 50 110 L 80 140 L 80 450 L 320 450 L 320 140 L 350 110 L 290 50 C 270 70 240 80 200 80 C 160 80 130 70 110 50 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
  <!-- Left sleeve -->
  <path d="M 110 50 L 50 110 L 80 140 L 130 80 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.15)" stroke-width="1" opacity="0.95"/>
  <!-- Right sleeve -->
  <path d="M 290 50 L 350 110 L 320 140 L 270 80 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.15)" stroke-width="1" opacity="0.95"/>
  <!-- Collar/Neckline -->
  <path d="M 110 50 C 130 70 160 80 200 80 C 240 80 270 70 290 50" 
    fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2.5"/>
  <!-- Ribbing detail -->
  <line x1="80" y1="140" x2="80" y2="180" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  <line x1="320" y1="140" x2="320" y2="180" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  <!-- Print area guide -->
  <rect x="140" y="160" width="120" height="140" rx="3" 
    fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" stroke-dasharray="8,4"/>
</svg>
`;
