import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

export const AnimatedDoozyLogo: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (custom: { delay: number, duration: number }) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: custom.delay, duration: custom.duration, ease: "easeInOut" as any },
        opacity: { delay: custom.delay, duration: 0.01 } // Prevents the dot artifact
      }
    })
  };

  return (
    <motion.div 
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#b16b76]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div 
        className="relative w-[320px] h-[320px]"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
      >
        
        {/* 1. The PURE Image Reveal (No Filters, No Inverted Colors) */}
        <svg viewBox="0 0 400 400" className="w-full h-full absolute inset-0 z-10">
          <defs>
            <mask id="logoDrawMask">
              {/* Start fully black (hidden) */}
              <rect width="400" height="400" fill="black" />
              
              {/* Draw in white to reveal the pure image underneath */}
              <motion.path
                d="M 150 100 L 150 200 C 240 220, 250 100, 150 100 Z"
                fill="none" stroke="white" strokeWidth="70" strokeLinecap="round" strokeLinejoin="round"
                variants={draw} custom={{ delay: 0.1, duration: 0.5 }} initial="hidden" animate="visible"
              />
              <motion.path
                d="M 200 60 A 90 90 0 1 1 199 60"
                fill="none" stroke="white" strokeWidth="45" strokeLinecap="round"
                variants={draw} custom={{ delay: 0.5, duration: 0.5 }} initial="hidden" animate="visible"
              />
              <motion.path
                d="M 70 280 L 330 280"
                fill="none" stroke="white" strokeWidth="70" strokeLinecap="round"
                variants={draw} custom={{ delay: 0.9, duration: 0.3 }} initial="hidden" animate="visible"
              />
              <motion.path
                d="M 100 340 L 300 340"
                fill="none" stroke="white" strokeWidth="30" strokeLinecap="round"
                variants={draw} custom={{ delay: 1.1, duration: 0.25 }} initial="hidden" animate="visible"
                onAnimationComplete={() => {
                  if (onComplete) {
                    setTimeout(onComplete, 250);
                  }
                }}
              />
            </mask>
          </defs>
          
          {/* 
            The exact image, NO grayscale, NO contrast filters, NO mixBlendMode. 
            This completely fixes the "black/inverted colors" bug on Safari Mobile
            and uses the exact colors as requested.
          */}
          <image 
            href="/logo.jpg" 
            width="400" 
            height="400" 
            mask="url(#logoDrawMask)"
          />
        </svg>

        {/* 2. The Final Pristine Image Crossfade */}
        <motion.div 
          className="absolute inset-0 w-full h-full z-20 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.3, ease: "easeIn" }}
        >
          <img src="/logo.jpg" alt="Doozy Logo" className="w-full h-full object-contain" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
