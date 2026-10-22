import React, { useState } from 'react';

interface DoozyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  imageClassName?: string;
  watermarkPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  watermarkOpacity?: number;
  hideWatermark?: boolean;
}

export const DoozyImage: React.FC<DoozyImageProps> = ({ 
  watermarkPosition = 'bottom-right', 
  watermarkOpacity = 0.7,
  imageClassName = "object-contain bg-stone-50",
  hideWatermark = false,
  className = '', 
  ...props 
}) => {
  const [loaded, setLoaded] = useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setLoaded(true);
    }
  }, [props.src]);

  const getWatermarkClasses = () => {
    switch (watermarkPosition) {
      case 'top-left': return 'top-4 left-4';
      case 'top-right': return 'top-4 right-4';
      case 'bottom-left': return 'bottom-4 left-4';
      case 'center': return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      case 'bottom-right':
      default: return 'bottom-4 right-4';
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      

      {/* Actual Image */}
      <img
        {...props}
        ref={imgRef}
        className={`w-full h-full ${imageClassName} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} `}
        onLoad={(e) => {
          setLoaded(true);
          if (props.onLoad) props.onLoad(e);
        }}
      />

      {/* Watermark Overlay */}
      {loaded && !hideWatermark && (
        <div 
          className={`absolute pointer-events-none select-none z-10 p-1 sm:p-2 bg-white/90 backdrop-blur-md rounded-xl border border-white shadow-lg flex items-center justify-center w-[25%] max-w-[80px] min-w-[40px] aspect-square ${getWatermarkClasses()}`}
        >
          <img src="/logo.jpg" alt="Doozy Watermark" className="w-full h-full object-contain rounded-md mix-blend-multiply opacity-100" />
        </div>
      )}
    </div>
  );
};
