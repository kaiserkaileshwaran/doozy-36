'use client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { ShoppingBag, PackageOpen, SearchX, AlertTriangle, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface EmptyStateProps {
  type: "cart" | "orders" | "search" | "inventory" | "wishlist" | "filter";
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionText,
  onAction
}) => {
  const router = useRouter();
  const { setCartDrawerOpen, resetFilter } = useStore();

  const getDefaults = () => {
    switch (type) {
      case 'cart':
        return {
          icon: <ShoppingBag className="w-12 h-12 text-[#800020] stroke-1" />,
          title: title || 'Your Shopping Bag is Empty',
          description:
            description ||
            'Experience our latest haute couture arrivals and timeless Burgundy essentials crafted for modern luxury.',
          actionText: actionText || 'Explore New Arrivals',
          action:
            onAction ||
            (() => {
              setCartDrawerOpen(false);
              router.push('/products');
            })
        };
      case 'orders':
        return {
          icon: <PackageOpen className="w-12 h-12 text-[#800020] stroke-1" />,
          title: title || 'No Orders Placed Yet',
          description:
            description ||
            'When you acquire an exceptional piece from the DOOZY Atelier, your white-glove order history will be curated here.',
          actionText: actionText || 'Discover The Collection',
          action:
            onAction ||
            (() => {
              router.push('/products');
            })
        };
      case 'search':
        return {
          icon: <SearchX className="w-12 h-12 text-[#800020] stroke-1" />,
          title: title || 'No Products Found',
          description:
            description ||
            'We could not find any creations matching your search parameters. Try adjusting your filters or search terms.',
          actionText: actionText || 'Reset All Filters',
          action:
            onAction ||
            (() => {
              resetFilter();
            })
        };
      case 'inventory':
        return {
          icon: <AlertTriangle className="w-12 h-12 text-amber-600 stroke-1" />,
          title: title || 'No Inventory Alerts',
          description:
            description ||
            'All haute couture garments, tailored blazers, and leather goods are currently well-stocked across atelier warehouses.',
          actionText: actionText || 'Refresh Stock Metrics',
          action: onAction || (() => {})
        };
      case 'wishlist':
        return {
          icon: <ShoppingBag className="w-12 h-12 text-[#800020] stroke-1" />,
          title: title || 'Your Wishlist is Empty',
          description:
            description ||
            'Save your favourite runway designs, evening gowns, and silk essentials to revisit anytime.',
          actionText: actionText || 'Browse Collection',
          action:
            onAction ||
            (() => {
              router.push('/products');
            })
        };
    }
  };

  const current = getDefaults();

  if (!current) return null;

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 my-6 bg-[#FAF9F6] rounded-sm border border-stone-200/80 max-w-lg mx-auto">
      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-stone-200 mb-5">
        {current.icon}
      </div>
      <h3 className="font-serif-luxury text-2xl md:text-3xl text-stone-900 font-medium tracking-tight">
        {current.title}
      </h3>
      <p className="text-stone-600 text-sm md:text-base mt-2.5 leading-relaxed max-w-md">
        {current.description}
      </p>
      {current.actionText && (
        <button
          onClick={current.action}
          className="mt-6 inline-flex items-center gap-2 bg-[#800020] hover:bg-[#5c0017] text-white px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-widest transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <span>{current.actionText}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
