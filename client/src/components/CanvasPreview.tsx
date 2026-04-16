/**
 * OBSIDIAN Canvas Preview — Carbon Fiber Design System
 * Renders mockup preview with SVG and image overlay
 */

import { useEffect, useRef } from "react";

interface CanvasPreviewProps {
  shirtColor: string;
  uploadedImage: string | null;
  imageX: number;
  imageY: number;
  imageScale: number;
  imageRotation: number;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const getTshirtSVG = (color: string) => `
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
  <!-- Seam lines -->
  <line x1="80" y1="140" x2="80" y2="450" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="5,5"/>
  <line x1="320" y1="140" x2="320" y2="450" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-dasharray="5,5"/>
  <!-- Print area guide -->
  <rect x="140" y="150" width="120" height="140" rx="3" 
    fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" stroke-dasharray="8,4"/>
</svg>
`;

export default function CanvasPreview({
  shirtColor,
  uploadedImage,
  imageX,
  imageY,
  imageScale,
  imageRotation,
  canvasRef,
}: CanvasPreviewProps) {
  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Render to canvas for download
  useEffect(() => {
    if (!canvasRef.current || !uploadedImage) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#0B0B0B";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw SVG as image
    const svg = new Image();
    svg.onload = () => {
      ctx.drawImage(svg, 0, 0, canvas.width, canvas.height);

      // Draw uploaded image
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const printX = (imageX / 100) * canvas.width;
        const printY = (imageY / 100) * canvas.height;

        ctx.save();
        ctx.translate(printX, printY);
        ctx.rotate((imageRotation * Math.PI) / 180);
        ctx.scale(imageScale, imageScale);

        const size = 120;
        ctx.drawImage(img, -size / 2, -size / 2, size, size);

        ctx.restore();
      };
      img.src = uploadedImage;
    };
    svg.src = `data:image/svg+xml;base64,${btoa(getTshirtSVG(shirtColor))}`;
  }, [uploadedImage, imageX, imageY, imageScale, imageRotation, shirtColor, canvasRef]);

  const printAreaStyle = (): React.CSSProperties => ({
    position: "absolute",
    left: `${imageX}%`,
    top: `${imageY}%`,
    transform: `translate(-50%, -50%) scale(${imageScale}) rotate(${imageRotation}deg)`,
    transformOrigin: "center",
    width: "120px",
    height: "120px",
    objectFit: "cover",
    borderRadius: "2px",
  });

  return (
    <div className="w-full max-w-sm aspect-square relative bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]" style={{ borderRadius: "4px" }}>
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative w-full h-full" ref={svgContainerRef}>
          {/* SVG Background */}
          <div dangerouslySetInnerHTML={{ __html: getTshirtSVG(shirtColor) }} />

          {/* Print image overlay */}
          {uploadedImage && (
            <img
              src={uploadedImage}
              alt="Estampa"
              style={printAreaStyle()}
            />
          )}

          {/* Placeholder text when no image */}
          {!uploadedImage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="font-heading text-center text-[rgba(239,239,239,0.25)] text-sm">
                Sua estampa<br />aparecerá aqui
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hidden Canvas for Download */}
      <canvas ref={canvasRef} className="hidden" width={400} height={500} />
    </div>
  );
}
