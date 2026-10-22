
'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { geocodeAddress, calculateDrivingDistance } from '../../lib/distanceUtils';
import { DoozyImage } from '../common/DoozyImage';
import { X, Minus, Plus, Trash2, Tag, ArrowRight, ShieldCheck, Heart, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CartDrawer: React.FC = () => {
  const router = useRouter();
  const { formatPrice,
    storeSettings,
    cartDrawerOpen: isCartOpen,
    setCartDrawerOpen: setIsCartOpen,
    cart,
    removeFromCart,
    updateCartQuantity: updateCartItemQuantity,
    cartSubtotal,
    cartDiscount,
    cartShipping,
    cartTax,
    cartTotal,
    appliedPromoCode,
    applyPromoCode,
    announcements,
    products,
    addToCart,
    toggleWishlist: addToWishlist,
    setFilter,
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

  const handleProceedToCheckout = () => {
    setCheckoutSessionCart(null);
    setIsCartOpen(false);
    router.push('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <aside className="fixed inset-0 z-[200]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm cursor-pointer"
            onClick={() => setIsCartOpen(false)}
          />

          <div className="absolute inset-y-0 right-0 w-full max-w-md pointer-events-none flex">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full bg-white flex flex-col pointer-events-auto h-full shadow-2xl"
            >
              {/* Header */}
              <div className="px-6 py-6 border-b border-stone-200 flex items-center justify-between shrink-0">
                <h3 className="font-serif-luxury text-2xl text-stone-900">Your Edit</h3>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 -mr-2 text-stone-400 hover:text-stone-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Shipping Banner */}
              {cartSubtotal > 0 && cartSubtotal < 5000 && (
                <div className="bg-stone-50 px-6 py-3 border-b border-stone-100 flex items-center justify-between text-xs text-stone-600">
                  <span>Add {formatPrice(5000 - cartSubtotal)} for Complimentary Shipping</span>
                  <div className="w-1/3 h-1 bg-stone-200 rounded-full overflow-hidden">
                    <div className="h-full bg-stone-900" style={{ width: `${(cartSubtotal / 5000) * 100}%` }} />
                  </div>
                </div>
              )}
              {cartSubtotal >= 500 && (
                <div className="bg-stone-900 text-white px-6 py-3 flex justify-center text-[10px] font-bold uppercase tracking-widest">
                  You have unlocked Complimentary Shipping
                </div>
              )}

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-16 h-16 border border-stone-200 rounded-full flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-stone-400" />
                    </div>
                    <div>
                      <h4 className="font-serif-luxury text-xl text-stone-900 mb-2">Your Edit is empty.</h4>
                      <p className="text-stone-500 text-sm">Discover our latest collection to begin.</p>
                    </div>
                    <button
                      onClick={() => { setIsCartOpen(false); setFilter(prev => ({...prev, category: 'All'})); router.push('/products'); }}
                      className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-900 border-b border-stone-900 pb-1 hover:text-[#800020] hover:border-[#800020] transition-colors"
                    >
                      Explore Collection
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map((item) => {
                      if (!item.product) return null;
                      const itemId = item.id || '';
                      const itemPrice = item.product.compareAtPrice || item.product.price;
                      return (
                        <div key={`${itemId}-${item.selectedSize}`} className="flex gap-4 group">
                          <DoozyImage  
                            src={item.product.images?.[0] || 'https://via.placeholder.com/150'}
                            alt={item.product.title}
                            className="w-24 h-32 object-cover bg-stone-50 shrink-0"
                            onClick={() => { setIsCartOpen(false); router.push('/products/' + item.product!.id); }}
                          />
                          <div className="flex flex-1 flex-col justify-between py-1">
                            <div>
                              <div className="flex justify-between items-start">
                                <h4 className="text-xs font-bold text-stone-900 leading-snug line-clamp-2 uppercase tracking-wide cursor-pointer"
                                    onClick={() => { setIsCartOpen(false); router.push('/products/' + item.product!.id); }}>
                                  {item.product.title}
                                </h4>
                                <button
                                  onClick={() => removeFromCart(itemId)}
                                  className="text-stone-400 hover:text-[#800020] transition-colors p-1"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                              <p className="text-[10px] text-stone-500 mt-1 uppercase tracking-wider">
                                Size: {item.selectedSize || 'N/A'}
                              </p>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center border border-stone-200">
                                <button
                                  onClick={() => updateCartItemQuantity(itemId, item.quantity - 1)}
                                  className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center text-xs font-bold text-stone-900">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateCartItemQuantity(itemId, item.quantity + 1)}
                                  className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-50 transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <span className="text-sm font-medium text-stone-900">
                                {formatPrice(itemPrice * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}


                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              {cart.length > 0 && (
                <div className="p-6 bg-white border-t border-stone-200 space-y-6">
                  {/* Promo Form & Available Coupons */}
                  <div className="space-y-4">
                    {announcements?.filter(a => a.isActive !== false && a.code && a.discountPercentage && !a.isHidden).length > 0 && !appliedPromoCode && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Available Offers</span>
                        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                          {announcements.filter(a => a.isActive !== false && a.code && a.discountPercentage && !a.isHidden).map((promo, idx) => (
                            <button key={promo.id + idx.toString()}
                              type="button"
                              onClick={() => applyPromoCode(promo.code!)}
                              className="shrink-0 bg-[#fdfbf7] border border-stone-200 px-3 py-2 text-left rounded-sm hover:border-[#800020] transition-colors"
                            >
                              <div className="text-[11px] font-bold text-stone-900">{promo.code}</div>
                              <div className="text-[10px] text-stone-500">{promo.discountPercentage}% OFF</div>
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
                        <span className="font-bold">Code {appliedPromoCode}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-bold">-{formatPrice(cartDiscount)}</span>
                          <button onClick={() => applyPromoCode('')} className="text-[10px] font-bold text-[#800020] hover:text-stone-900 uppercase tracking-widest transition-colors border-b border-[#800020] hover:border-stone-900 pb-[1px]">Remove</button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="space-y-2 text-xs text-stone-600 font-medium">
                    <div className="flex justify-between">
                      <span>Item Total</span>
                      <span className="text-stone-900">{formatPrice(cartSubtotal)}</span>
                    </div>
                    {cartDiscount > 0 && (
                      <div className="flex justify-between text-[#800020]">
                        <span>VIP Discount</span>
                        <span>- {formatPrice(cartDiscount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2">
                      <span className="font-bold">Subtotal</span>
                      <span className="text-stone-900 font-bold">{formatPrice(cartSubtotal - cartDiscount)}</span>
                    </div>
                    {cartShipping > 0 && (
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span className="text-stone-900">{formatPrice(cartShipping)}</span>
                      </div>
                    )} 
                    <div className="flex justify-between text-stone-600">
                      <span>Tax ({storeSettings?.taxRate || 0}%)</span>
                      <span className="text-stone-900">{formatPrice(cartTax)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-stone-900 font-bold pt-4 border-t border-stone-200">
                      <span>Estimated Total</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleProceedToCheckout}
                    className="w-full bg-stone-900 hover:bg-black text-white py-4 text-[11px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Secure Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  
                  <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Encrypted & Secure Payment</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </aside>
      )}
    </AnimatePresence>
  );
};
