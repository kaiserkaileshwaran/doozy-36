import React from 'react';
import { DoozyLogo } from '../components/common/DoozyLogo';

export default function Loading() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center bg-transparent">
      <div className="relative flex items-center justify-center w-20 h-20">
        <div className="absolute inset-0 border-t-2 border-r-2 border-[#A86370] rounded-full animate-spin duration-1000"></div>
        <div className="animate-pulse flex items-center justify-center">
          <DoozyLogo variant="icon" theme="burgundy" size="md" />
        </div>
      </div>
      <p className="mt-6 text-[9px] uppercase tracking-[0.4em] text-[#A86370] font-bold animate-pulse">
        Curating Elegance
      </p>
    </div>
  );
}
