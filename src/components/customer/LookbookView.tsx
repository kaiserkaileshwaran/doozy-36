'use client';
import { useRouter } from 'next/navigation';
import { useStore } from '../../context/StoreContext';
import { Sparkles, ShoppingBag, Eye, ArrowRight, Heart, Award } from 'lucide-react';
import { motion } from 'motion/react';

export const LookbookView: React.FC = () => {
  const router = useRouter();
  const {
    products,
    setSelectedProduct,
    addToCart,
    formatPrice,
    toggleWishlist,
    isInWishlist
  } = useStore();

  const looks = [
    {
      id: 'look-1',
      title: 'Look 01: The Royal Chanderi Sovereign',
      season: 'Festive & Bridal Atelier 2026',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1400&q=85',
      location: 'Chowmahalla Palace, Hyderabad',
      description: 'Handwoven pure Chanderi silk Chudithar suit featuring pure gold zari booties, teamed with a hand-loomed Banarasi Katan silk dupatta.',
      product: products[0] || products[0]
    },
    {
      id: 'look-2',
      title: 'Look 02: Lucknowi Chikankari Poise',
      season: 'Heritage Summer Edit',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1400&q=85',
      location: 'Bara Imambara, Lucknow',
      description: 'Georgette Angrakha kurta embellished with 32 traditional shadow-work Chikankari stitches and authentic Mukaish hand highlights.',
      product: products[1] || products[0]
    },
    {
      id: 'look-3',
      title: 'Look 03: Fluid Modal Silk & Dabu Modernism',
      season: 'Contemporary Casuals 2026',
      image: 'https://images.unsplash.com/photo-1596783074418-c44ab833c21e?auto=format&fit=crop&w=1400&q=85',
      location: 'Amethyst Haveli, Jaipur',
      description: 'Lustrous modal silk notched-collar tunic paired with matching pleated cigarette trousers in rich royal burgundy.',
      product: products[2] || products[0]
    }
  ];

  return (
    <div className="w-full max-w-[5120px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      {/* Editorial Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#800020]/10 text-[#800020] text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Curated Indian Runway Series</span>
        </div>
        <h1 className="font-serif-luxury text-4xl sm:text-6xl text-stone-900 font-normal">
          The DOOZY Royal Lookbook
        </h1>
        <p className="text-stone-600 text-sm sm:text-base font-light leading-relaxed">
          Explore complete celebratory and casual ensembles captured against iconic Indian architectural landmarks. Each product celebrates our generational weavers and master tailors.
        </p>
      </div>

      {/* Looks Stream */}
      <div className="space-y-24">
        {looks.map((look, index) => {
          const isEven = index % 2 === 0;
          const targetProduct = look.product || products[index % products.length] || products[0];
          const isWished = targetProduct ? isInWishlist(targetProduct.id) : false;
          const prodImg = targetProduct?.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=85';
          const prodTitle = targetProduct?.title || 'DOOZY Royal Garment';
          const prodPrice = targetProduct?.price || 0;

          return (
            <div
              key={look.id}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center ${
                isEven ? '' : 'lg:flex-row-reverse'
              }`}
            >
              {/* Runway Image Container */}
              <div className={`lg:col-span-7 relative rounded-sm overflow-hidden shadow-md bg-stone-900 aspect-4/5 group ${!isEven ? 'lg:order-2' : ''}`}>
                <img
                  src={look.image}
                  alt={look.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-amber-200 block mb-0.5">
                    {look.location}
                  </span>
                  <p className="font-serif-luxury text-xl text-white font-medium">{look.title}</p>
                </div>
              </div>

              {/* Look Info & Shoppable Piece */}
              <div className={`lg:col-span-5 space-y-6 ${!isEven ? 'lg:order-1' : ''}`}>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#800020] block mb-1">
                    {look.season}
                  </span>
                  <h2 className="font-serif-luxury text-3xl sm:text-4xl text-stone-900 font-normal">
                    {look.title}
                  </h2>
                  <p className="text-stone-600 text-xs sm:text-sm mt-3 leading-relaxed">
                    {look.description}
                  </p>
                </div>

                {/* Shoppable Product Card in Lookbook */}
                {targetProduct && (
                  <div className="bg-white p-5 rounded-sm border border-stone-200 shadow-sm flex items-center gap-4">
                    <img
                      src={prodImg}
                      alt={prodTitle}
                      className="w-18 h-24 object-cover rounded-sm border border-stone-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#800020] block">
                        Featured In Look
                      </span>
                      <h4 className="text-xs font-bold text-stone-900 truncate">
                        {prodTitle}
                      </h4>
                      <span className="font-serif-luxury font-bold text-sm text-[#800020] mt-1 block">
                        {formatPrice(prodPrice)}
                      </span>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => {
                            setSelectedProduct(targetProduct);
                            router.push('/products/' + (targetProduct?.id || ''));
                          }}
                          className="text-[11px] font-bold uppercase tracking-wider text-stone-700 hover:text-[#800020] underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Inspect Ensemble</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {targetProduct && (
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => addToCart(targetProduct)}
                      className="bg-[#800020] hover:bg-[#5c0017] text-white px-7 py-3 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Acquire Look</span>
                    </button>

                    <button
                      onClick={() => toggleWishlist(targetProduct.id)}
                      className={`w-11 h-11 rounded-sm border flex items-center justify-center transition-all cursor-pointer ${
                        isWished ? 'border-[#800020] bg-[#800020]/10 text-[#800020]' : 'border-stone-200 text-stone-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isWished ? 'fill-[#800020]' : ''}`} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
