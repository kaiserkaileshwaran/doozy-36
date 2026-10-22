'use client';
import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';

export const PromotionModal: React.FC = () => {
  const { promotion } = useStore();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    if (pathname?.startsWith('/admin')) {
      setIsOpen(false);
      return;
    }
    
    if (promotion?.isActive) {
      const hasShown = sessionStorage.getItem('doozy_promo_shown');
      if (!hasShown) {
        const timer = setTimeout(() => setIsOpen(true), 1500);
        return () => clearTimeout(timer);
      }
    } else {
      setIsOpen(false);
    }
  }, [promotion, pathname]);

  const activeSlides = promotion?.slides || (promotion?.images ? promotion.images.map(img => ({ desktopImage: img, mobileImage: img, link: '' })) : []);

  useEffect(() => {
    if (isOpen && activeSlides.length > 1) {
      const interval = setInterval(() => {
        setCurrentImg(prev => (prev + 1) % activeSlides.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen, activeSlides.length]);

  if (!promotion || !promotion.isActive || !isOpen) return null;

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('doozy_promo_shown', 'true');
  };

  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImg(prev => (prev + 1) % activeSlides.length);
  };
  
  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImg(prev => (prev - 1 + activeSlides.length) % activeSlides.length);
  };
  
  const handleAction = () => {
    const currentLink = activeSlides[currentImg]?.link;
    handleClose();
    if (currentLink) {
      window.location.href = currentLink;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-0 md:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full h-[100dvh] md:h-auto md:max-w-[800px] md:aspect-video bg-transparent rounded-none md:rounded-[20px] overflow-hidden shadow-2xl flex flex-col group cursor-pointer"
            onClick={handleAction}
          >
            <button
              onClick={(e) => { e.stopPropagation(); handleClose(); }}
              className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-black/30 hover:bg-black/60 text-white rounded-full backdrop-blur-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            {activeSlides.length > 0 && (
              <div className="relative w-full h-full overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.picture
                    key={currentImg}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <source media="(max-width: 768px)" srcSet={activeSlides[currentImg]?.mobileImage || ''} />
                    <img
                      src={activeSlides[currentImg]?.desktopImage || ''}
                      alt="Promotion"
                      className="w-full h-full object-cover"
                    />
                  </motion.picture>
                </AnimatePresence>
                
                {activeSlides.length > 1 && (
                  <>
                    <button onClick={prevImg} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 hover:bg-black/50 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={nextImg} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 hover:bg-black/50 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {activeSlides.map((_, i) => (
                        <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentImg ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
