'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const BagPage: React.FC = () => {
  const router = useRouter();
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    cartDiscount,
    cartShipping,
    cartTax,
    cartTotal,
    formatPrice,
    storeSettings,
    announcements,
    appliedPromoCode,
    applyPromoCode,
    setCheckoutSessionCart
  } = useStore();

  const [promoInput, setPromoInput] = useState('');

  const handleApplyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoInput.trim()) {
      applyPromoCode(promoInput.trim().toUpperCase());
      setPromoInput('');
    }
  };

  const FREE_SHIPPING_THRESHOLD = 5000;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);
  const progressPercent = Math.min(100, Math.round((cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100));

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
            <ShoppingBag className="w-6 h-6 text-[#800020]" />
            <h1 className="font-serif-luxury text-3xl font-bold text-stone-900">Shopping Bag</h1>
            <span className="text-sm font-semibold bg-[#800020] text-white px-2.5 py-0.5 rounded-full">
              {cart.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[5120px] mx-auto px-4 sm:px-8 py-8">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-9 h-9 text-stone-400" />
            </div>
            <h2 className="font-serif-luxury text-3xl text-stone-900 mb-3">No Products in the Cart</h2>
            <p className="text-stone-500 text-sm mb-8 max-w-sm">
              Explore our handloom kurtas, chudithar sets, and festive dresses to fill your wardrobe.
            </p>
            <button
              onClick={() => router.push('/products')}
              className="bg-[#800020] text-white px-8 py-3 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-[#5c0017] transition-all"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Free shipping bar */}
              <div className="bg-white rounded-sm border border-stone-200 px-5 py-4">
                <div className="flex items-center justify-between text-xs mb-2 font-medium">
                  {remainingForFreeShipping === 0 ? (
                    <span className="text-emerald-700 flex items-center gap-1.5 font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      You've unlocked Free Pan-India Express Delivery!
                    </span>
                  ) : (
                    <span className="text-stone-600">
                      Add <strong className="text-[#800020]">{formatPrice(remainingForFreeShipping)}</strong> more for free delivery
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-stone-500">{progressPercent}%</span>
                </div>
                <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#800020] h-full transition-all duration-500 rounded-full" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>

              {cart.map((item, index) => {
                const img = item.product?.images?.[0] || '';
                const title = item.product?.title || 'DOOZY Product';
                const price = item.product?.price || 0;

                return (
                  <div
                    key={item.id || index}
                    className="flex gap-4 p-5 rounded-sm bg-white border border-stone-200 shadow-xs"
                  >
                    <div className="w-24 h-32 rounded-sm overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                      {img && <img src={img} alt={title} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <h4 className="text-sm font-bold text-stone-900 line-clamp-2 leading-snug">{title}</h4>
                        <div className="flex items-center gap-2 mt-1 text-[10px] font-medium text-stone-500">
                          <span>Size: {item.selectedSize}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full border border-stone-300 inline-block" style={{ background: item.selectedColor?.hex }} />
                            {item.selectedColor?.name}
                          </span>
                        </div>
                        <p className="font-serif-luxury text-base font-bold text-[#800020] mt-2">{formatPrice(price * item.quantity)}</p>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 bg-stone-100 rounded-full px-2 py-1">
                          <button
                            onClick={() => updateCartQuantity(item.id!, item.quantity - 1)}
                            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-stone-200 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id!, item.quantity + 1)}
                            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-stone-200 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id!)}
                          className="text-stone-400 hover:text-red-500 transition-colors cursor-pointer"
                          aria-label="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-sm border border-stone-200 p-6 sticky top-24">
                <h3 className="font-serif-luxury text-xl font-bold text-stone-900 mb-5">Order Summary</h3>
                
                {/* Promo UI */}
                <div className="mb-6 pb-6 border-b border-stone-200">
                  <div className="space-y-4">
                    {announcements?.filter(a => a.isActive !== false && a.code && a.discountPercentage && !a.isHidden).length > 0 && !appliedPromoCode && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Available Offers</span>
                        <div className="flex flex-col gap-2">
                          {announcements.filter(a => a.isActive !== false && a.code && a.discountPercentage && !a.isHidden).map((promo, idx) => (
                            <button key={promo.id + idx.toString()}
                              type="button"
                              onClick={() => applyPromoCode(promo.code!)}
                              className="text-left w-full bg-[#fdfbf7] border border-stone-200 px-3 py-2 rounded-sm hover:border-[#800020] transition-colors flex justify-between items-center"
                            >
                              <span className="text-[11px] font-bold text-stone-900">{promo.code}</span>
                              <span className="text-[10px] text-stone-500">{promo.discountPercentage}% OFF</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {!appliedPromoCode ? (
                      <form onSubmit={handleApplyCode} className="flex gap-3">
                        <input
                          type="text"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          placeholder="PROMO CODE"
                          className="flex-1 bg-transparent border-b border-stone-300 py-2 text-xs uppercase tracking-wider focus:outline-none focus:border-stone-900 placeholder:text-stone-400"
                        />
                        <button
                          type="submit"
                          className="text-[10px] font-bold uppercase tracking-widest text-stone-900 hover:text-[#800020]"
                        >
                          Apply
                        </button>
                      </form>
                    ) : (
                      <div className="flex justify-between items-center text-xs text-[#800020] bg-[#f9e6e9] px-4 py-3 border border-[#e099a8] rounded-sm">
                        <span className="font-bold">Code applied: {appliedPromoCode}</span>
                        <button onClick={() => applyPromoCode('')} className="text-[10px] font-bold text-[#800020] hover:text-stone-900 uppercase tracking-widest transition-colors border-b border-[#800020] hover:border-stone-900 pb-[1px]">Remove</button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-stone-700">
                    <span>Item Total</span>
                    <span className="font-semibold">{formatPrice(cartSubtotal)}</span>
                  </div>
                  {cartDiscount > 0 && (
                    <div className="flex justify-between text-[#800020]">
                      <span>VIP Discount</span>
                      <span className="font-semibold">− {formatPrice(cartDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-stone-900 font-bold pt-2 border-t border-stone-100">
                    <span>Subtotal</span>
                    <span className="font-bold">{formatPrice(cartSubtotal - cartDiscount)}</span>
                  </div>
                  <div className="flex justify-between text-stone-700">
                    <span>Shipping</span>
                    <span className="font-semibold">{cartShipping === 0 ? 'Free' : formatPrice(cartShipping)}</span>
                  </div>
                  <div className="flex justify-between text-stone-700">
                    <span>Tax ({storeSettings?.taxRate || 0}%)</span>
                    <span className="font-semibold">{formatPrice(cartTax)}</span>
                  </div>
                  <div className="border-t border-stone-200 pt-3 flex justify-between">
                    <span className="font-bold text-stone-900">Total</span>
                    <span className="font-serif-luxury font-bold text-lg text-[#800020]">{formatPrice(cartTotal)}</span>
                  </div>
                </div>
                <button
                  onClick={() => { setCheckoutSessionCart(null); router.push('/checkout'); }}
                  className="w-full mt-6 bg-[#800020] hover:bg-[#5c0017] text-white py-4 rounded-sm text-xs font-bold uppercase tracking-widest transition-all shadow-md cursor-pointer"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={() => router.push('/products')}
                  className="w-full mt-3 text-stone-600 hover:text-[#800020] text-xs font-semibold underline underline-offset-2 transition-colors cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
