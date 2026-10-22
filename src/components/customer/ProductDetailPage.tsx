'use client';
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': any;
    }
  }
}

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { Heart, Truck, ShieldCheck, Star, ChevronDown, ChevronUp, ArrowRight, Minus, Plus } from 'lucide-react';
import { DoozyImage } from '../common/DoozyImage';
import { motion, AnimatePresence } from 'motion/react';
import { ImmersiveGallery } from '../common/ImmersiveGallery';
import { ProductCard } from '../common/ProductCard';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export const ProductDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const [is3DMode, setIs3DMode] = useState(false);
  
  const { addToCart, wishlist, toggleWishlist, products, setCartDrawerOpen, setCheckoutSessionCart, reviews, showToast } = useStore();
  const product = products.find(p => p.id === slug || (p.title && p.title.toLowerCase().replace(/\s+/g, '-') === slug));
  
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  
  const [selectedColor, setSelectedColor] = useState<any>(product?.colors?.[0] || null);
  const [hoveredColor, setHoveredColor] = useState<any>(null);

  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (lightboxOpen) {
        setLightboxOpen(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [lightboxOpen]);

  const openLightbox = () => {
    setLightboxOpen(true);
    window.history.pushState({ lightbox: true }, '');
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    if (window.history.state?.lightbox) {
      window.history.back();
    }
  };
  const [openAccordions, setOpenAccordions] = useState({ details: true, shipping: false });

  if (!product) return <div className="p-20 text-center">Product not found</div>;

  const images = product.images || [];
  const sizes = product.sizes || ['XS', 'S', 'M', 'L', 'XL'];
  const isWished = wishlist.includes(product.id);

  const handleAddToCart = () => {
    if (!selectedSize) {
      showToast('Size Required', 'Please select a size before adding to cart.', 'error');
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      showToast('Color Required', 'Please select a color before adding to cart.', 'error');
      return;
    }
    addToCart(product, selectedSize, selectedColor, quantity, false);
    setCartDrawerOpen(true);
    setQuantity(1); // Reset quantity after adding
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      showToast('Size Required', 'Please select a size before proceeding to checkout.', 'error');
      return;
    }
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      showToast('Color Required', 'Please select a color before proceeding to checkout.', 'error');
      return;
    }
    
    // Add to standard cart so it's not lost if user aborts checkout
    addToCart(product, selectedSize, selectedColor, quantity, false);
    
    // Set checkout session for immediate flow
    setCheckoutSessionCart([{
      id: `${product.id}-${selectedSize}-${selectedColor?.name || 'Default'}`,
      product,
      selectedSize,
      selectedColor,
      quantity
    }]);
    router.push('/checkout');
  };

  const recommendations = products.filter(p => p.id !== product.id).slice(0, 4);

  return (
    <div className="bg-white min-h-screen">
      <div className={lightboxOpen ? "hidden" : "pt-4 pb-24"}>
      
      <div className="w-full max-w-[5120px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-500">
          <Link href="/" className="hover:text-stone-900 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-stone-900 transition-colors">Clothing</Link>
          <span>/</span>
          <span className="text-stone-900">{product.title}</span>
        </div>
      </div>

      <div className="w-full max-w-[5120px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-12">
          
          <div className="w-full lg:w-[55%] flex flex-col sm:flex-row gap-4">
            <div className="order-2 sm:order-1 flex sm:flex-col gap-2 sm:gap-4 w-full sm:w-20 shrink-0 overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImgIndex(i)}
                  className={`relative shrink-0 aspect-[3/4] w-16 sm:w-full overflow-hidden bg-stone-50 transition-opacity hover:opacity-80 ${activeImgIndex === i ? 'ring-1 ring-stone-900 ring-offset-1' : ''}`}
                >
                  <DoozyImage src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" hideWatermark={true} />
                </button>
              ))}
            </div>

            <div className="order-1 sm:order-2 flex-1 relative aspect-[3/4] bg-stone-50 overflow-hidden group">
              {is3DMode && product.model3dUrl ? (
                <div className="w-full h-full relative z-10">
                  {product.model3dUrl.includes('sketchfab.com') ? (
                    <iframe
                      title={product.title}
                      width="100%"
                      height="100%"
                      src={product.model3dUrl}
                      frameBorder="0"
                      allow="autoplay; fullscreen; xr-spatial-tracking"
                      allowFullScreen
                      style={{ backgroundColor: '#f5f5f4' }}
                    ></iframe>
                  ) : (
                    React.createElement('model-viewer', {
                      src: product.model3dUrl,
                      alt: product.title,
                      'auto-rotate': true,
                      'camera-controls': true,
                      ar: true,
                      'shadow-intensity': 1,
                      style: { width: '100%', height: '100%', backgroundColor: '#f5f5f4' }
                    })
                  )}
                  
                  <button
                    onClick={() => setIs3DMode(false)}
                    className="absolute top-4 right-4 bg-white/90 p-2 shadow-sm hover:bg-white text-stone-900 transition-colors z-20 rounded-md"
                  >
                    Exit 3D View
                  </button>
                </div>
              ) : (
                <>
                  <DoozyImage
                    src={images[activeImgIndex]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    onClick={openLightbox}
                  />
                  
                  <button
                    onClick={openLightbox}
                    className="absolute top-4 right-4 bg-white/90 p-2 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white text-stone-900 rounded-md z-10"
                  >
                    View Fullscreen
                  </button>

                  {product.model3dUrl && (
                    <button
                      onClick={() => setIs3DMode(true)}
                      className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-stone-900 text-white px-6 py-3 text-xs font-bold uppercase tracking-widest shadow-xl hover:bg-stone-800 transition-colors z-20 rounded-full flex items-center gap-2"
                    >
                      View in 3D
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="w-full lg:w-[45%] flex flex-col pt-2 lg:pl-4">
            <div className="mb-8">
              <h1 className="text-3xl font-serif text-stone-900 mb-2 leading-tight">{product.title}</h1>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xl text-stone-700">₹{product.price.toLocaleString('en-IN')}</p>
                <div className="flex items-center gap-1 text-stone-400">
                  {(() => {
                    const productReviews = reviews?.filter(r => r.productId === product.id && r.status === 'Accepted') || [];
                    if (productReviews.length === 0) {
                      return <span className="text-xs uppercase tracking-widest text-stone-500 font-bold">No Reviews</span>;
                    }
                    const avgRating = Math.round(productReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / productReviews.length);
                    return (
                      <>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 fill-current ${i < avgRating ? 'text-[#D4AF37]' : 'text-stone-300'}`} />
                        ))}
                        <span className="text-xs ml-1 text-stone-500">({productReviews.length})</span>
                      </>
                    );
                  })()}
                </div>
              </div>
              <p className="text-sm text-stone-500 leading-relaxed">{product.description || "Luxurious handcrafted design blending traditional aesthetics with modern comfort."}</p>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-stone-900">Size</span>
                <button className="text-xs text-stone-500 underline underline-offset-4 hover:text-stone-900">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-3">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`w-12 h-12 flex items-center justify-center border text-sm transition-colors ${selectedSize === s ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 text-stone-600 hover:border-stone-900'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {product.colors && product.colors.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-stone-900">
                    Color: <span className="font-normal text-stone-500">{hoveredColor?.name || selectedColor?.name || ''}</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((c: any) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c)}
                      onMouseEnter={() => setHoveredColor(c)}
                      onMouseLeave={() => setHoveredColor(null)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor?.name === c.name ? 'border-stone-900 scale-110' : 'border-transparent hover:scale-110 shadow-sm'}`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-stone-900">Quantity</span>
                <span className="text-sm font-serif-luxury font-bold text-[#800020]">
                  Subtotal: ₹{((product.price || 0) * quantity).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex items-center border border-stone-300 rounded-sm overflow-hidden bg-white w-fit">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  className="w-12 h-12 flex items-center justify-center hover:bg-stone-50 transition-colors border-r border-stone-200"
                >
                  <Minus className="w-4 h-4 text-stone-600" />
                </button>
                <div className="w-12 h-12 flex items-center justify-center font-bold text-sm text-stone-900">
                  {quantity}
                </div>
                <button 
                  onClick={() => {
                    if (quantity < (product.stockQuantity || 1)) {
                      setQuantity(quantity + 1);
                    } else {
                      showToast("Stock Limit Reached", `Only ${product.stockQuantity} units available.`, "error");
                    }
                  }} 
                  className="w-12 h-12 flex items-center justify-center hover:bg-stone-50 transition-colors border-l border-stone-200"
                >
                  <Plus className="w-4 h-4 text-stone-600" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-10">
              {product.stockQuantity <= 0 ? (
                <div className="flex gap-3">
                  <button
                    disabled
                    className="flex-1 py-4 text-xs font-bold uppercase tracking-widest bg-rose-600 text-white cursor-not-allowed shadow-sm border border-rose-600"
                  >
                    Out of Stock
                  </button>
                  <button 
                    onClick={() => toggleWishlist(product.id)}
                    className={`w-14 flex items-center justify-center border transition-colors ${isWished ? 'border-rose-200 bg-rose-50 text-rose-500' : 'border-stone-200 text-stone-400 hover:border-stone-900 hover:text-stone-900'}`}
                    title="Add to Wishlist"
                  >
                    <Heart className={`w-5 h-5 ${isWished ? 'fill-current' : ''}`} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={!selectedSize}
                      className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${selectedSize ? 'bg-stone-900 text-white hover:bg-stone-800' : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}
                    >
                      {selectedSize ? 'Add to Cart' : 'Select a Size'}
                    </button>
                    <button 
                      onClick={() => toggleWishlist(product.id)}
                      className={`w-14 flex items-center justify-center border transition-colors ${isWished ? 'border-rose-200 bg-rose-50 text-rose-500' : 'border-stone-200 text-stone-400 hover:border-stone-900 hover:text-stone-900'}`}
                      title="Add to Wishlist"
                    >
                      <Heart className={`w-5 h-5 ${isWished ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  <button
                    onClick={handleBuyNow}
                    disabled={!selectedSize}
                    className={`w-full py-4 text-xs font-bold uppercase tracking-widest border border-stone-900 transition-colors ${selectedSize ? 'bg-white text-stone-900 hover:bg-stone-50' : 'opacity-50 cursor-not-allowed'}`}
                  >
                    Buy it Now
                  </button>
                </>
              )}
            </div>

            <div className="border-t border-stone-200 divide-y divide-stone-200">
              <div className="py-4">
                <button 
                  className="w-full flex items-center justify-between text-sm font-bold uppercase tracking-widest text-stone-900"
                  onClick={() => setOpenAccordions(prev => ({ ...prev, details: !prev.details }))}
                >
                  <span>Details & Care</span>
                  {openAccordions.details ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <AnimatePresence>
                  {openAccordions.details && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <ul className="pt-4 space-y-2 text-sm text-stone-500 list-disc pl-4">
                        <li>Premium natural fibers</li>
                        <li>Hand-finished details</li>
                        <li>Dry clean only</li>
                        <li>Made with sustainable practices</li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="py-4">
                <button 
                  className="w-full flex items-center justify-between text-sm font-bold uppercase tracking-widest text-stone-900"
                  onClick={() => setOpenAccordions(prev => ({ ...prev, shipping: !prev.shipping }))}
                >
                  <span>Shipping & Returns</span>
                  {openAccordions.shipping ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <AnimatePresence>
                  {openAccordions.shipping && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 space-y-3 text-sm text-stone-500">
                        <div className="flex items-start gap-3">
                          <Truck className="w-4 h-4 mt-0.5 shrink-0" />
                          <p>Free standard shipping on orders over ₹5,000. Delivery typically within 3-5 business days.</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
                          <p>Free returns within 14 days of delivery. Items must be unworn with original tags attached.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {recommendations.length > 0 && (
          <div className="mt-32">
            <div className="flex items-center justify-between mb-8 border-b border-stone-200 pb-4">
              <h2 className="text-xl font-serif text-stone-900">You May Also Like</h2>
              <Link href="/products" className="text-xs font-bold uppercase tracking-widest text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {recommendations.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
      </div>
      
      <ImmersiveGallery
        images={images}
        initialIndex={activeImgIndex}
        isOpen={lightboxOpen}
        onClose={closeLightbox}
        productName={product.title}
      />
    </div>
  );
};
