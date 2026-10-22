import React from 'react';

interface DoozyLogoProps {
  variant?: 'full' | 'icon' | 'wordmark';
  theme?: 'burgundy' | 'white' | 'gold' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const DoozyLogo: React.FC<DoozyLogoProps> = ({
  variant = 'full',
  theme = 'burgundy',
  size = 'md',
  className = ''
}) => {
  const getThemeColors = () => {
    switch (theme) {
      case 'white':
        return {
          primary: '#FFFFFF',
          accent: '#FDE047',
          sub: '#F5F5F4',
          bg: 'transparent'
        };
      case 'gold':
        return {
          primary: '#D4AF37',
          accent: '#E5C058',
          sub: '#DFD8C8',
          bg: 'transparent'
        };
      case 'dark':
        return {
          primary: '#1C1917',
          accent: '#721C24',
          sub: '#57534E',
          bg: 'transparent'
        };
      case 'burgundy':
      default:
        return {
          primary: '#721C24',
          accent: '#D4AF37',
          sub: '#800020',
          bg: 'transparent'
        };
    }
  };

  const colors = getThemeColors();

  const sizeDimensions = {
    sm: { icon: 28, text: 'text-lg', sub: 'text-[7px]' },
    md: { icon: 38, text: 'text-2xl', sub: 'text-[9px]' },
    lg: { icon: 48, text: 'text-3xl', sub: 'text-[11px]' },
    xl: { icon: 64, text: 'text-4xl', sub: 'text-[13px]' }
  };

  const currentSize = sizeDimensions[size];

  const renderIcon = () => (
    <div 
      className="relative flex items-center justify-center shrink-0" 
      style={{ width: currentSize.icon, height: currentSize.icon }}
    >
      <img src="/logo.jpg" alt="Doozy Logo" className="w-full h-full object-contain rounded-md overflow-hidden" />
    </div>
  );

  const renderWordmark = () => (
    <div className="flex flex-col select-none leading-none">
      <div className="flex items-baseline gap-1">
        <span 
          className={`font-serif-luxury font-bold tracking-normal ${currentSize.text}`}
          style={{ color: colors.primary, fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Doozy
        </span>
        <span 
          className="text-[9px] font-bold" 
          style={{ color: colors.accent }}
        >
          ®
        </span>
      </div>
      <span 
        className={`font-sans uppercase font-bold tracking-[0.28em] mt-0.5 ${currentSize.sub}`}
        style={{ color: colors.sub }}
      >
        WOMEN'S CLOTHING
      </span>
    </div>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center ${className}`}>{renderIcon()}</div>;
  }

  if (variant === 'wordmark') {
    return <div className={`inline-flex items-center ${className}`}>{renderWordmark()}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {renderIcon()}
      {renderWordmark()}
    </div>
  );
};
