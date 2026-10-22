import React from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '../../types';
import { Heart, Star } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { DoozyImage } from './DoozyImage';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const router = useRouter();
  const { wishlist, toggleWishlist, reviews, formatPrice, addToCart, setCartDrawerOpen, setSelectedProduct } = useStore();
  const isWished = wishlist.includes(product.id);
  
  const images = product.images?.filter(Boolean) || ['https://via.placeholder.com/800x1200'];

  return (
    <div className="group flex flex-col relative cursor-pointer" 
      onClick={() => { 
        if (typeof window !== 'undefined' && product.category) localStorage.setItem('preferredCategory', product.category);
        setSelectedProduct(product); 
        router.push('/products/' + (product.slug || product.id)); 
      }}>
      <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden mb-4 rounded-[25px] shadow-sm border border-stone-200 group/image">
        
        <div className="w-full h-full relative">
          <DoozyImage loading="lazy" 
            src={images[0]} 
            alt={product.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-105" 
          />
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {(() => {
            const isRecent = (id: string) => {
              const parts = id.split('-');
              if (parts.length > 1) {
                const time = parseInt(parts[1]);
                if (!isNaN(time) && time > 1000000000000) {
                  return Date.now() - time < 7 * 24 * 60 * 60 * 1000;
                }
              }
              return false;
            };
            const showNew = product.isNew || isRecent(product.id);
            return showNew ? <span className="bg-white/80 backdrop-blur-sm text-stone-900 text-[9px] font-bold uppercase tracking-widest px-2 py-1 shadow-sm rounded-sm">New</span> : null;
          })()}
          {product.stockQuantity <= 0 && <span className="bg-rose-600/90 backdrop-blur-sm text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 shadow-sm rounded-sm">Out of Stock</span>}
          {product.discountPercentage && product.discountPercentage > 0 && <span className="bg-[#800020]/90 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-1 shadow-sm">{product.discountPercentage}% Off</span>}
          {(() => {
            const productReviews = reviews?.filter(r => r.productId === product.id && r.status === 'Accepted') || [];
            if (productReviews.length === 0) {
              return (
                <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 shadow-sm rounded-sm self-start">
                  <span className="text-[9px] font-bold text-stone-900 tracking-widest uppercase">No Reviews</span>
                </div>
              );
            }
            const avgRating = (productReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / productReviews.length).toFixed(1);
            return (
              <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 shadow-sm rounded-sm self-start">
                <Star className="w-2.5 h-2.5 fill-[#D4AF37] text-[#D4AF37]" />
                <span className="text-[9px] font-bold text-stone-900 tracking-widest">{avgRating} / 5</span>
              </div>
            );
          })()}
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
          className="absolute top-3 right-3 p-2 bg-white/50 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-white z-20"
        >
          <Heart className={`w-4 h-4 ${isWished ? 'fill-[#800020] text-[#800020]' : 'text-stone-900'}`} />
        </button>

      </div>

      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-1">{product.category}</p>
        <h3 className="text-sm font-bold text-stone-900 leading-snug line-clamp-1 group-hover:text-[#800020] transition-colors">{product.title}</h3>
        <div className="mt-2 flex items-center gap-2">
          {product.discountPercentage ? (
            <>
              <span className="text-xs font-bold text-[#800020]">{formatPrice(product.price * (1 - product.discountPercentage / 100))}</span>
              <span className="text-[10px] text-stone-400 line-through">{formatPrice(product.price)}</span>
            </>
          ) : (
            <>
              <span className="text-xs font-medium text-stone-900">{formatPrice(product.price)}</span>
              {product.compareAtPrice && <span className="text-[10px] text-stone-400 line-through">{formatPrice(product.compareAtPrice)}</span>}
            </>
          )}
        </div>
        <p className="text-[10px] text-stone-400 mt-2 uppercase tracking-wider">{product.sizes?.length || 0} Sizes Available</p>
      </div>
    </div>
  );
};
