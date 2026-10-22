import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="w-full aspect-3/4 bg-stone-200 rounded-lg overflow-hidden relative">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-3 w-1/3 bg-stone-200 rounded" />
        <div className="h-4 w-3/4 bg-stone-200 rounded" />
        <div className="h-3.5 w-1/4 bg-stone-200 rounded" />
      </div>
    </div>
  );
};

export const TableRowSkeleton: React.FC<{ cols?: number }> = ({ cols = 5 }) => {
  return (
    <tr className="animate-pulse border-b border-stone-100">
      {Array.from({ length: cols }).map((_, idx) => (
        <td key={idx} className="py-4 px-4">
          <div className="h-4 bg-stone-200 rounded w-full max-w-[120px]" />
        </td>
      ))}
    </tr>
  );
};

export const PDPSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-[5120px] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12 animate-pulse">
      <div className="lg:col-span-7 grid grid-cols-2 gap-4">
        <div className="aspect-3/4 bg-stone-200 rounded-lg" />
        <div className="aspect-3/4 bg-stone-200 rounded-lg" />
      </div>
      <div className="lg:col-span-5 space-y-6">
        <div className="h-4 w-1/4 bg-stone-200 rounded" />
        <div className="h-8 w-3/4 bg-stone-200 rounded" />
        <div className="h-6 w-1/3 bg-stone-200 rounded" />
        <div className="h-20 bg-stone-200 rounded" />
        <div className="h-12 w-full bg-stone-200 rounded" />
      </div>
    </div>
  );
};
