/**
 * OBSIDIAN Product Gallery — Carbon Fiber Design System
 * Image gallery with zoom, thumbnails and lightbox functionality
 */

import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, X } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  return (
    <>
      {/* Main Gallery */}
      <div className="space-y-4">
        {/* Main Image */}
        <div
          ref={imageRef}
          className="relative overflow-hidden bg-[#111111] border border-[rgba(255,255,255,0.06)] group cursor-zoom-in"
          style={{ aspectRatio: "1", borderRadius: "4px" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={images[selectedIndex]}
            alt={`${productName} - Imagem ${selectedIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-300"
            style={{
              transform: isZoomed ? `scale(2) translate(calc(${50 - zoomPos.x}% / 2), calc(${50 - zoomPos.y}% / 2))` : "scale(1)",
            }}
          />

          {/* Zoom button overlay */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(!isZoomed);
            }}
            className="absolute top-4 right-4 w-10 h-10 bg-[rgba(11,11,11,0.7)] backdrop-blur-sm border border-[rgba(255,255,255,0.15)] flex items-center justify-center text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] hover:border-[rgba(255,255,255,0.4)] transition-all opacity-0 group-hover:opacity-100"
            title="Zoom"
          >
            <ZoomIn size={16} />
          </button>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[rgba(11,11,11,0.7)] backdrop-blur-sm border border-[rgba(255,255,255,0.15)] flex items-center justify-center text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] hover:border-[rgba(255,255,255,0.4)] transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-[rgba(11,11,11,0.7)] backdrop-blur-sm border border-[rgba(255,255,255,0.15)] flex items-center justify-center text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] hover:border-[rgba(255,255,255,0.4)] transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {/* Image counter */}
          <div className="absolute bottom-4 left-4 font-mono-label text-[rgba(239,239,239,0.4)] bg-[rgba(11,11,11,0.6)] backdrop-blur-sm px-2.5 py-1.5 text-[0.65rem]">
            {selectedIndex + 1} / {images.length}
          </div>
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`flex-shrink-0 w-16 h-16 border-2 transition-all duration-200 ${
                  selectedIndex === idx
                    ? "border-white"
                    : "border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.3)]"
                }`}
                style={{ borderRadius: "2px" }}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-[rgba(11,11,11,0.95)] backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] transition-colors"
          >
            <X size={24} />
          </button>

          {/* Lightbox image */}
          <div className="relative max-w-4xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[selectedIndex]}
              alt={`${productName} - Fullscreen`}
              className="w-full h-full object-contain"
            />

            {/* Lightbox navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[rgba(11,11,11,0.7)] backdrop-blur-sm border border-[rgba(255,255,255,0.15)] flex items-center justify-center text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] transition-all"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-[rgba(11,11,11,0.7)] backdrop-blur-sm border border-[rgba(255,255,255,0.15)] flex items-center justify-center text-[rgba(239,239,239,0.6)] hover:text-[#EFEFEF] transition-all"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}

            {/* Counter */}
            <div className="absolute bottom-4 left-4 font-mono-label text-[rgba(239,239,239,0.4)] bg-[rgba(11,11,11,0.6)] backdrop-blur-sm px-3 py-2 text-[0.7rem]">
              {selectedIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
