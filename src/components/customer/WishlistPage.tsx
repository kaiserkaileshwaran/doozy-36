'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Trash2, ArrowLeft } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const WishlistPage: React.FC = () => {
  const router = useRouter();
  const { wishlist, products, toggleWishlist, formatPrice } = useStore();

  const wishedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Page Header */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-8 py-6">
        <div className="w-full max-w-[5120px] mx-auto flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-[#800020] fill-current" />
            <h1 className="font-serif-luxury text-3xl font-bold text-stone-900">Your Wishlist</h1>
            <span className="text-sm font-semibold bg-[#800020] text-white px-2.5 py-0.5 rounded-full">
              {wishedProducts.length}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[5120px] mx-auto px-4 sm:px-8 py-8">
        {wishedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-9 h-9 text-stone-400" />
            </div>
            <h2 className="font-serif-luxury text-3xl text-stone-900 mb-3">No Products in Wishlist</h2>
            <p className="text-stone-500 text-sm mb-8 max-w-sm">
              Save your favorite Kurtas and festive Chudithar sets to easily find them later.
            </p>
            <button
              onClick={() => router.push('/products')}
              className="bg-[#800020] text-white px-8 py-3 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-[#5c0017] transition-all"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {wishedProducts.map(prod => (
              <div
                key={prod.id}
                className="bg-white rounded-sm p-4 border border-stone-200 flex flex-col justify-between"
              >
                <div 
                  className="relative aspect-3/4 rounded-sm overflow-hidden mb-3 cursor-pointer group"
                  onClick={() => router.push(`/products/${prod.id}`)}
                >
                  <img src={prod.images?.[0]} alt={prod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleWishlist(prod.id); }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 text-red-600 flex items-center justify-center shadow hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-stone-900 truncate mb-1">
                    {prod.title}
                  </h4>
                  <div className="flex justify-between items-center">
                    <span className="font-serif-luxury text-[#800020] font-bold">
                      {formatPrice(prod.price)}
                    </span>
                    <button
                      onClick={() => router.push(`/products/${prod.id}`)}
                      className="text-[10px] font-bold uppercase tracking-wider text-stone-500 hover:text-[#800020]"
                    >
                      View Product
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
