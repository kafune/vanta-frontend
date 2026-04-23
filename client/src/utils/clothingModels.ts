/**
 * Clothing Model SVG Generators
 * Generates SVG mockups for different clothing models with sleeve customization
 */

import { ClothingModel } from "@/components/ModelSelector";

export type SleeveLength = "short" | "long";

export const getClothingSVG = (
  model: ClothingModel,
  color: string,
  sleeveLength: SleeveLength = "short"
): string => {
  switch (model) {
    case "regular-shirt":
      return getRegularShirtSVG(color, sleeveLength);
    case "oversized-shirt":
      return getOversizedShirtSVG(color, sleeveLength);
    case "long-sleeve":
      return getLongSleeveSVG(color);
    case "tank-top":
      return getTankTopSVG(color);
    case "regular-hoodie":
      return getRegularHoodieSVG(color, sleeveLength);
    case "oversized-hoodie":
      return getOversizedHoodieSVG(color, sleeveLength);
    case "sweatshirt":
      return getSweatshirtSVG(color, sleeveLength);
    default:
      return getRegularShirtSVG(color, sleeveLength);
  }
};

// Regular T-Shirt with sleeve customization
const getRegularShirtSVG = (color: string, sleeveLength: SleeveLength) => {
  const sleeveEndX = sleeveLength === "long" ? 20 : 60;
  const sleeveEndY = sleeveLength === "long" ? 200 : 140;

  return `
<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" fill="none">
  <!-- Body -->
  <path d="M 120 60 L 80 100 L 80 450 L 320 450 L 320 100 L 280 60 C 260 75 230 85 200 85 C 170 85 140 75 120 60 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
  
  <!-- Left sleeve -->
  <path d="M 120 60 L ${sleeveEndX} ${sleeveEndY} L 80 ${sleeveEndY + 30} L 80 100 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.15)" stroke-width="1" opacity="0.95"/>
  
  <!-- Right sleeve -->
  <path d="M 280 60 L ${400 - sleeveEndX} ${sleeveEndY} L 320 ${sleeveEndY + 30} L 320 100 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.15)" stroke-width="1" opacity="0.95"/>
  
  <!-- Collar -->
  <ellipse cx="200" cy="65" rx="85" ry="25" 
    fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2.5"/>
  
  <!-- Neckline -->
  <path d="M 140 70 Q 200 85 260 70" 
    fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
  
  <!-- Print area guide -->
  <rect x="130" y="150" width="140" height="160" rx="3" 
    fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" stroke-dasharray="8,4"/>
  
  <!-- Sleeve cuff details -->
  ${sleeveLength === "short" ? `
    <circle cx="60" cy="170" r="12" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <circle cx="340" cy="170" r="12" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  ` : `
    <line x1="40" y1="230" x2="100" y2="230" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
    <line x1="300" y1="230" x2="360" y2="230" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
  `}
</svg>
`;
};

// Oversized T-Shirt with sleeve customization
const getOversizedShirtSVG = (color: string, sleeveLength: SleeveLength) => {
  const sleeveEndX = sleeveLength === "long" ? 10 : 50;
  const sleeveEndY = sleeveLength === "long" ? 220 : 150;

  return `
<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" fill="none">
  <!-- Body - wider -->
  <path d="M 90 70 L 40 110 L 40 450 L 360 450 L 360 110 L 310 70 C 290 85 250 95 200 95 C 150 95 110 85 90 70 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
  
  <!-- Left sleeve - wider and longer -->
  <path d="M 90 70 L ${sleeveEndX} ${sleeveEndY} L 40 ${sleeveEndY + 35} L 40 110 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.15)" stroke-width="1" opacity="0.95"/>
  
  <!-- Right sleeve - wider and longer -->
  <path d="M 310 70 L ${400 - sleeveEndX} ${sleeveEndY} L 360 ${sleeveEndY + 35} L 360 110 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.15)" stroke-width="1" opacity="0.95"/>
  
  <!-- Collar -->
  <ellipse cx="200" cy="75" rx="100" ry="30" 
    fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2.5"/>
  
  <!-- Neckline -->
  <path d="M 120 80 Q 200 95 280 80" 
    fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
  
  <!-- Print area guide -->
  <rect x="120" y="160" width="160" height="180" rx="3" 
    fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" stroke-dasharray="8,4"/>
  
  <!-- Sleeve cuff details -->
  ${sleeveLength === "short" ? `
    <circle cx="45" cy="185" r="14" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <circle cx="355" cy="185" r="14" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  ` : `
    <line x1="20" y1="255" x2="90" y2="255" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
    <line x1="310" y1="255" x2="380" y2="255" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
  `}
</svg>
`;
};

// Long Sleeve Shirt (always long)
const getLongSleeveSVG = (color: string) => `
<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" fill="none">
  <!-- Body -->
  <path d="M 120 60 L 80 100 L 80 450 L 320 450 L 320 100 L 280 60 C 260 75 230 85 200 85 C 170 85 140 75 120 60 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
  
  <!-- Left sleeve - long -->
  <path d="M 120 60 L 15 150 L 50 200 L 80 200 L 80 100 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.15)" stroke-width="1" opacity="0.95"/>
  
  <!-- Right sleeve - long -->
  <path d="M 280 60 L 385 150 L 350 200 L 320 200 L 320 100 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.15)" stroke-width="1" opacity="0.95"/>
  
  <!-- Collar -->
  <ellipse cx="200" cy="65" rx="85" ry="25" 
    fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2.5"/>
  
  <!-- Neckline -->
  <path d="M 140 70 Q 200 85 260 70" 
    fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
  
  <!-- Wrist cuffs -->
  <line x1="30" y1="200" x2="100" y2="200" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
  <line x1="300" y1="200" x2="370" y2="200" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
  
  <!-- Print area guide -->
  <rect x="130" y="150" width="140" height="160" rx="3" 
    fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" stroke-dasharray="8,4"/>
</svg>
`;

// Tank Top (no sleeves)
const getTankTopSVG = (color: string) => `
<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" fill="none">
  <!-- Body - no sleeves -->
  <path d="M 140 50 L 140 120 L 80 450 L 320 450 L 260 120 L 260 50 C 250 60 220 70 200 70 C 180 70 150 60 140 50 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
  
  <!-- Left armhole -->
  <path d="M 140 50 Q 120 80 140 120" 
    fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
  
  <!-- Right armhole -->
  <path d="M 260 50 Q 280 80 260 120" 
    fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
  
  <!-- Collar -->
  <ellipse cx="200" cy="55" rx="70" ry="20" 
    fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2.5"/>
  
  <!-- Neckline -->
  <path d="M 150 60 Q 200 70 250 60" 
    fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
  
  <!-- Print area guide -->
  <rect x="130" y="150" width="140" height="180" rx="3" 
    fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" stroke-dasharray="8,4"/>
</svg>
`;

// Regular Hoodie with sleeve customization
const getRegularHoodieSVG = (color: string, sleeveLength: SleeveLength) => {
  const sleeveEndX = sleeveLength === "long" ? 20 : 60;
  const sleeveEndY = sleeveLength === "long" ? 210 : 140;

  return `
<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" fill="none">
  <!-- Body -->
  <path d="M 120 80 L 80 120 L 80 450 L 320 450 L 320 120 L 280 80 C 260 95 230 105 200 105 C 170 105 140 95 120 80 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
  
  <!-- Left sleeve -->
  <path d="M 120 80 L ${sleeveEndX} ${sleeveEndY} L 80 ${sleeveEndY + 30} L 80 120 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.15)" stroke-width="1" opacity="0.95"/>
  
  <!-- Right sleeve -->
  <path d="M 280 80 L ${400 - sleeveEndX} ${sleeveEndY} L 320 ${sleeveEndY + 30} L 320 120 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.15)" stroke-width="1" opacity="0.95"/>
  
  <!-- Hood -->
  <path d="M 140 80 Q 200 20 260 80" 
    fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2.5"/>
  
  <!-- Hood interior -->
  <path d="M 150 85 Q 200 35 250 85" 
    fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
  
  <!-- Drawstring -->
  <path d="M 180 105 Q 200 115 220 105" 
    stroke="rgba(255,255,255,0.25)" stroke-width="2" fill="none"/>
  
  <!-- Drawstring ends -->
  <circle cx="175" cy="103" r="2" fill="rgba(255,255,255,0.3)"/>
  <circle cx="225" cy="103" r="2" fill="rgba(255,255,255,0.3)"/>
  
  <!-- Print area guide -->
  <rect x="130" y="160" width="140" height="160" rx="3" 
    fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" stroke-dasharray="8,4"/>
  
  <!-- Sleeve cuff details -->
  ${sleeveLength === "short" ? `
    <circle cx="60" cy="170" r="12" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <circle cx="340" cy="170" r="12" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  ` : `
    <line x1="40" y1="240" x2="100" y2="240" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
    <line x1="300" y1="240" x2="360" y2="240" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
  `}
</svg>
`;
};

// Oversized Hoodie with sleeve customization
const getOversizedHoodieSVG = (color: string, sleeveLength: SleeveLength) => {
  const sleeveEndX = sleeveLength === "long" ? 10 : 50;
  const sleeveEndY = sleeveLength === "long" ? 230 : 150;

  return `
<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" fill="none">
  <!-- Body - wider -->
  <path d="M 90 90 L 40 130 L 40 450 L 360 450 L 360 130 L 310 90 C 290 105 250 115 200 115 C 150 115 110 105 90 90 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
  
  <!-- Left sleeve - wider -->
  <path d="M 90 90 L ${sleeveEndX} ${sleeveEndY} L 40 ${sleeveEndY + 35} L 40 130 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.15)" stroke-width="1" opacity="0.95"/>
  
  <!-- Right sleeve - wider -->
  <path d="M 310 90 L ${400 - sleeveEndX} ${sleeveEndY} L 360 ${sleeveEndY + 35} L 360 130 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.15)" stroke-width="1" opacity="0.95"/>
  
  <!-- Hood - larger -->
  <path d="M 120 90 Q 200 15 280 90" 
    fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2.5"/>
  
  <!-- Hood interior -->
  <path d="M 135 95 Q 200 30 265 95" 
    fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
  
  <!-- Drawstring -->
  <path d="M 160 115 Q 200 125 240 115" 
    stroke="rgba(255,255,255,0.25)" stroke-width="2" fill="none"/>
  
  <!-- Drawstring ends -->
  <circle cx="155" cy="113" r="2" fill="rgba(255,255,255,0.3)"/>
  <circle cx="245" cy="113" r="2" fill="rgba(255,255,255,0.3)"/>
  
  <!-- Print area guide -->
  <rect x="120" y="170" width="160" height="180" rx="3" 
    fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" stroke-dasharray="8,4"/>
  
  <!-- Sleeve cuff details -->
  ${sleeveLength === "short" ? `
    <circle cx="45" cy="185" r="14" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <circle cx="355" cy="185" r="14" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  ` : `
    <line x1="20" y1="265" x2="90" y2="265" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
    <line x1="310" y1="265" x2="380" y2="265" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
  `}
</svg>
`;
};

// Sweatshirt with sleeve customization
const getSweatshirtSVG = (color: string, sleeveLength: SleeveLength) => {
  const sleeveEndX = sleeveLength === "long" ? 20 : 60;
  const sleeveEndY = sleeveLength === "long" ? 210 : 140;

  return `
<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" fill="none">
  <!-- Body -->
  <path d="M 110 60 L 70 100 L 70 450 L 330 450 L 330 100 L 290 60 C 270 75 240 85 200 85 C 160 85 130 75 110 60 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
  
  <!-- Left sleeve -->
  <path d="M 110 60 L ${sleeveEndX} ${sleeveEndY} L 70 ${sleeveEndY + 30} L 70 100 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.15)" stroke-width="1" opacity="0.95"/>
  
  <!-- Right sleeve -->
  <path d="M 290 60 L ${400 - sleeveEndX} ${sleeveEndY} L 330 ${sleeveEndY + 30} L 330 100 Z" 
    fill="${color}" stroke="rgba(255,255,255,0.15)" stroke-width="1" opacity="0.95"/>
  
  <!-- Collar/Neckline -->
  <ellipse cx="200" cy="65" rx="80" ry="22" 
    fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="2.5"/>
  
  <!-- Ribbing detail on collar -->
  <path d="M 140 70 Q 200 80 260 70" 
    fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
  
  <!-- Sleeve ribbing -->
  <line x1="70" y1="100" x2="70" y2="140" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
  <line x1="330" y1="100" x2="330" y2="140" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
  
  <!-- Waist ribbing -->
  <line x1="70" y1="450" x2="330" y2="450" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
  
  <!-- Print area guide -->
  <rect x="130" y="150" width="140" height="160" rx="3" 
    fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" stroke-dasharray="8,4"/>
  
  <!-- Sleeve cuff details -->
  ${sleeveLength === "short" ? `
    <circle cx="55" cy="170" r="12" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
    <circle cx="345" cy="170" r="12" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
  ` : `
    <line x1="35" y1="240" x2="95" y2="240" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
    <line x1="305" y1="240" x2="365" y2="240" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
  `}
</svg>
`;
};
