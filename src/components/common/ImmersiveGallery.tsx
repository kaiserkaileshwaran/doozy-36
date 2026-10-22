import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { DoozyImage } from './DoozyImage';

interface ImmersiveGalleryProps {
  images: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  productName: string;
}

export const ImmersiveGallery: React.FC<ImmersiveGalleryProps> = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
  productName
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (containerRef.current) {
          const targetImage = containerRef.current.children[initialIndex] as HTMLElement;
          if (targetImage) {
            targetImage.scrollIntoView({ behavior: 'auto', block: 'start' });
          }
        }
      }, 50);
    }
  }, [isOpen, initialIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="w-full bg-white pt-4 pb-0 animate-in fade-in duration-300">
      {/* Cancel Button - FIXED to stay on screen underneath the header */}
      <div className="fixed top-[108px] lg:top-[96px] right-4 z-[95]">
        <button 
          onClick={onClose} 
          className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-stone-900 shadow-[0_4px_16px_rgba(0,0,0,0.15)] border border-stone-200 hover:bg-white transition-all cursor-pointer active:scale-95"
          aria-label="Close Gallery"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Scrollable Images Container */}
      <div ref={containerRef} className="w-full flex flex-col items-center">
        {images.map((img, idx) => (
          <div 
            key={idx} 
            className="w-full flex justify-center scroll-mt-[100px]"
          >
            <DoozyImage
              src={img}
              alt={`${productName} - View ${idx + 1}`}
              className="w-full h-auto aspect-[3/4]" 
              imageClassName="object-contain bg-stone-50"
              hideWatermark={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
