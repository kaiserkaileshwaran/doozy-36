'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../common/ProductCard';
import { Star, ChevronRight, ChevronLeft, MapPin, Clock, Phone, ArrowRight } from 'lucide-react';
import { ShortsViewer } from './ShortsViewer';
import { motion } from 'motion/react';
export const HorizontalScroll = ({ children, arrowTop = "top-[38%]", theme = "light", gapClass = "gap-4 sm:gap-6" }: { children: React.ReactNode, arrowTop?: string, theme?: "light" | "dark", gapClass?: string }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scrollByAmount = (amount: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
      setTimeout(checkScroll, 400); // Check after animation
    }
  };

  const btnClass = theme === 'dark' 
    ? `absolute z-10 p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/30 text-white backdrop-blur-md border border-white/20 shadow-xl transition-all duration-700 ease-[0.22,1,0.36,1] cursor-pointer hover:scale-105` 
    : `absolute z-10 p-3 sm:p-4 rounded-full bg-white/90 hover:bg-white text-stone-900 backdrop-blur-md border border-stone-200 shadow-xl transition-all duration-700 ease-[0.22,1,0.36,1] cursor-pointer hover:scale-105`;

  return (
    <div className="relative group/nav w-full">
      <button 
        onClick={(e) => { e.stopPropagation(); scrollByAmount(-400); }}
        disabled={!canScrollLeft}
        className={`${btnClass} left-2 sm:left-4 z-20 ${arrowTop} -translate-y-1/2 ${!canScrollLeft ? 'opacity-0 pointer-events-none' : 'opacity-100 sm:opacity-0 group-hover/nav:opacity-100 flex items-center justify-center'}`}
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className={`flex overflow-x-auto snap-x snap-mandatory ${gapClass} py-8 hide-scrollbar px-4 sm:px-0 -my-4`} 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style dangerouslySetInnerHTML={{__html: `.hide-scrollbar::-webkit-scrollbar { display: none; }`}} />
        {children}
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); scrollByAmount(400); }}
        disabled={!canScrollRight}
        className={`${btnClass} right-2 sm:right-4 z-20 ${arrowTop} -translate-y-1/2 ${!canScrollRight ? 'opacity-0 pointer-events-none' : 'opacity-100 sm:opacity-0 group-hover/nav:opacity-100 flex items-center justify-center'}`}
        aria-label="Scroll right"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
};

export const Homepage: React.FC = () => {
  const router = useRouter();
  const { 
    categories, 
    products, 
    reviews, 
    branches,
    currentUser,
    setFilter,
    homepageConfig,
    addReview
  } = useStore();

  const isConfigEmpty = !homepageConfig || (
    (!homepageConfig.hero?.title) && 
    (!homepageConfig.heroSlides || homepageConfig.heroSlides.length === 0)
  );
  
  const safeConfig = homepageConfig || {
    sectionOrder: ['hero', 'categories', 'products', 'branches', 'about', 'reviews'],
    hero: { desktopImage: '', mobileImage: '', title: '', subtitle: '', description: '' },
    heroSlides: [],
    about: { image: '', title: '', description: '' },
    visibleCategories: []
  };

  let { hero, heroSlides, about, sectionOrder } = safeConfig;
  
  // Guarantee crucial sections are rendered even if Firebase config was corrupted by old admin saves
  const requiredSections = ['hero', 'about', 'categories', 'suggestions', 'offers', 'reviews'];
  let finalSectionOrder = sectionOrder ? [...sectionOrder] : [];
  if (finalSectionOrder.length < 4) {
    finalSectionOrder = [...requiredSections];
  } else {
    requiredSections.forEach(req => {
      if (!finalSectionOrder.includes(req)) finalSectionOrder.push(req);
    });
    finalSectionOrder = requiredSections.filter(s => finalSectionOrder.includes(s));
  }
  const slides = heroSlides && heroSlides.length > 0 ? heroSlides : [
    { id: 'default-1', desktopImage: hero?.desktopImage || "", mobileImage: hero?.mobileImage || "", title: hero?.title || "" }
  ];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const [preferredCategory, setPreferredCategory] = useState<string | null>(null);

  const branchesContainerRef = useRef<HTMLDivElement>(null);
  const reviewsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPreferredCategory(localStorage.getItem('preferredCategory'));
    }
  }, []);

  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!products || products.length === 0) return;
    
    let suggested: any[] = [];
    if (preferredCategory) {
      const prefProds = products.filter(p => p.category === preferredCategory);
      const sortedPref = [...prefProds].reverse();
      suggested = sortedPref.slice(0, 4);
      if (suggested.length < 4) {
        const extra = [...products].filter(p => !suggested.find(s => s?.id === p.id)).sort(() => 0.5 - Math.random()).slice(0, 4 - suggested.length);
        suggested = [...suggested, ...extra];
      }
    } else {
      const categoriesSet = Array.from(new Set(products.map(p => p.category)));
      let picked: any[] = [];
      categoriesSet.forEach(cat => {
        const catProds = products.filter(p => p.category === cat);
        if (catProds.length > 0) {
          picked.push(catProds[Math.floor(Math.random() * catProds.length)]);
        }
      });
      suggested = picked.sort(() => 0.5 - Math.random()).slice(0, 4);
      if (suggested.length < 4) {
         const remaining = [...products].filter(p => !suggested.find(s => s?.id === p.id)).sort(() => 0.5 - Math.random());
         suggested = [...suggested, ...remaining].slice(0, 4);
      }
    }
    setSuggestedProducts(suggested.filter(Boolean));
  }, [products, preferredCategory]);

  const offerProducts = products.filter(p => p.compareAtPrice && p.compareAtPrice > p.price).slice(0, 4);
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
  const newArrivals = products.filter(p => p.isNew || isRecent(p.id)).reverse();

  useEffect(() => {
    const scrollBranches = () => {
      if (branchesContainerRef.current && !isHeroPaused) {
        const { scrollLeft, clientWidth, scrollWidth } = branchesContainerRef.current;
        const maxScroll = scrollWidth - clientWidth;
        let newScroll = scrollLeft + clientWidth;
        if (scrollLeft >= maxScroll - 10) newScroll = 0;
        branchesContainerRef.current.scrollTo({ left: newScroll, behavior: 'smooth' });
      }
    };
    const scrollReviews = () => {
      if (reviewsContainerRef.current && !isHeroPaused) {
        const { scrollLeft, clientWidth, scrollWidth } = reviewsContainerRef.current;
        const maxScroll = scrollWidth - clientWidth;
        let newScroll = scrollLeft + clientWidth;
        if (scrollLeft >= maxScroll - 10) newScroll = 0;
        reviewsContainerRef.current.scrollTo({ left: newScroll, behavior: 'smooth' });
      }
    };

    const branchInterval = setInterval(scrollBranches, 4000);
    const reviewInterval = setInterval(scrollReviews, 5000);
    
    let slideInterval: any;
    if (!isHeroPaused) {
      slideInterval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
      }, 5000);
    }
    
    return () => {
      clearInterval(branchInterval);
      clearInterval(reviewInterval);
      if (slideInterval) clearInterval(slideInterval);
    };
  }, [branches, reviews, isHeroPaused, slides.length]);

  const handleProductClick = (product: any) => {
    router.push('/products/' + product.id);
  };
  
  const handleCategorySelect = (name: string) => {
    router.push('/categories/' + name);
  };

  const renderSection = (key: string) => {
    switch (key) {
      case 'hero':
        if (isConfigEmpty) {
          return (
            <section key="hero" className="flex flex-col items-center justify-center min-h-[75vh] bg-[#fdfbf7] text-[#1c1917] px-6 text-center">
              <h1 className="font-serif-luxury text-4xl md:text-6xl font-bold mb-4 tracking-wide text-[#800020]">Welcome to DOOZY</h1>
              <p className="text-stone-500 max-w-lg mb-8 uppercase tracking-widest text-xs font-bold leading-relaxed">We are deeply pleased to have you here. <br/><span className="text-stone-400 font-normal">Our exclusive Home Page collections are being prepared with the utmost care.</span></p>
              <button onClick={() => router.push('/products')} className="bg-[#800020] text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#5c0017] transition-colors duration-700 ease-[0.22,1,0.36,1]">View All Products</button>
            </section>
          );
        }
        return (
          <section 
            key="hero" 
            className="relative h-[45vh] lg:h-[50vh] flex flex-col justify-center overflow-hidden bg-stone-900 group"
            onMouseEnter={() => setIsHeroPaused(true)}
            onMouseLeave={() => setIsHeroPaused(false)}
          >
            {slides.map((slide, idx) => (
              <div key={idx} className={`absolute inset-0 transition-opacity duration-1000 ${idx === currentSlide ? 'opacity-100 z-0' : 'opacity-0 -z-10'}`}>
                <picture>
                  <source media="(max-width: 768px)" srcSet={slide.mobileImage || hero?.mobileImage || ''} />
                  <img
                    src={slide.desktopImage || hero?.desktopImage || ''}
                    alt={slide.title || hero?.title || "Hero"}
                    className="w-full h-full object-cover opacity-75"
                  />
                </picture>
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-[1]" />
            

            {slides.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1)); }}
                  className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-4 bg-white/10 hover:bg-white/30 text-white rounded-full backdrop-blur-md border border-white/20 transition-all duration-700 ease-[0.22,1,0.36,1] opacity-100 sm:opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-xl cursor-pointer hover:scale-105"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setCurrentSlide(prev => (prev === slides.length - 1 ? 0 : prev + 1)); }}
                  className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-4 bg-white/10 hover:bg-white/30 text-white rounded-full backdrop-blur-md border border-white/20 transition-all duration-700 ease-[0.22,1,0.36,1] opacity-100 sm:opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-xl cursor-pointer hover:scale-105"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </>
            )}
            <button 
              onClick={() => setIsHeroPaused(!isHeroPaused)}
              className="absolute top-24 right-4 sm:top-32 sm:right-8 z-20 p-3 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-md border border-white/10 transition-colors duration-700 ease-[0.22,1,0.36,1] opacity-100 sm:opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-lg"
              aria-label={isHeroPaused ? "Play slide" : "Pause slide"}
            >
              {isHeroPaused ? (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              )}
            </button>
            
            {slides.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {slides.map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'}`}
                  />
                ))}
              </div>
            )}

          </section>
        );

      case 'categories':
        return (
          <section key="categories" className="py-4 sm:py-5 bg-white overflow-hidden">
            <div className="w-full max-w-[5120px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center mb-4 sm:mb-6 text-center">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-500 mb-2">Curated Wardrobe</span>
                <h2 className="font-serif-luxury text-3xl sm:text-4xl text-stone-900">Shop By Category</h2>
              </div>
              
              <HorizontalScroll>
                {[...categories].sort((a,b) => (a.order || 0) - (b.order || 0)).map((cat) => (
                  <div key={cat.id} onClick={() => handleCategorySelect(cat.name)} className="snap-start shrink-0 w-[42vw] sm:w-[220px] lg:w-[260px] 2xl:w-[320px] min-[1920px]:w-[380px] group cursor-pointer flex flex-col items-center">
                    <div className="w-full aspect-[3/4] overflow-hidden mb-4 bg-stone-50">
                      <img loading="lazy" src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-stone-900 group-hover:text-[#800020] transition-colors duration-700 ease-[0.22,1,0.36,1] text-center">
                      {cat.name}
                    </span>
                  </div>
                ))}
              </HorizontalScroll>
            </div>
          </section>
        );

      case 'suggestions':
        if (suggestedProducts.length === 0) return null;
        return (
          <section key="suggestions" className="py-4 sm:py-5 bg-[#FAFAFA]">
            <div className="w-full max-w-[5120px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-end mb-4 sm:mb-6 gap-6">
                <div>
                  <h2 className="font-serif-luxury text-4xl sm:text-5xl text-stone-900 mb-4">Suggested For You</h2>
                  <p className="text-stone-500 text-sm max-w-md">Personalized recommendations based on your unique style.</p>
                </div>
                <button onClick={() => { setFilter(prev => ({ ...prev, category: 'All' })); router.push('/products'); }} className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-stone-900 hover:text-[#800020] transition-colors duration-700 ease-[0.22,1,0.36,1] pb-1 border-b border-stone-900 hover:border-[#800020]">
                  Shop The Edit <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <HorizontalScroll>
                {suggestedProducts.map(product => (
                  <div key={product.id} className="snap-start shrink-0 w-[70vw] sm:w-[280px] lg:w-[320px] 2xl:w-[400px] min-[1920px]:w-[450px]">
                    <ProductCard product={product} />
                  </div>
                ))}
              </HorizontalScroll>
            </div>
          </section>
        );

      case 'offers':
        if (newArrivals.length === 0) return null;
        return (
          <section key="offers" className="py-4 sm:py-5 bg-white">
            <div className="w-full max-w-[5120px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-end mb-4 sm:mb-6">
                <div>
                  <h2 className="font-serif-luxury text-3xl sm:text-4xl text-stone-900 mb-2">New Arrivals</h2>
                  <p className="text-stone-500 text-sm">Discover the latest additions to our collection.</p>
                </div>
              </div>
              <HorizontalScroll>
                {newArrivals.map(product => (
                  <div key={product.id} className="snap-start shrink-0 w-[70vw] sm:w-[280px] lg:w-[320px] 2xl:w-[400px] min-[1920px]:w-[450px]">
                    <ProductCard product={product} />
                  </div>
                ))}
              </HorizontalScroll>
            </div>
          </section>
        );

      
      case 'reviews':
        return (
          <React.Fragment key="reviews">
            <section className="py-4 sm:py-5 bg-stone-900 text-white overflow-hidden">
              <div className="w-full max-w-[5120px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10 sm:mb-12">
                  <h2 className="font-serif-luxury text-4xl text-white">Customer Reviews</h2>
                </div>
                
                <HorizontalScroll arrowTop="top-1/2" theme="dark" gapClass="gap-8">
                  {reviews.filter(r => r.status === 'Accepted').map((review, idx) => (
                    <div key={idx} className="group snap-center shrink-0 w-[85vw] sm:w-[500px] flex flex-col justify-center items-center text-center p-8 sm:p-12 border border-white/10 bg-white/5 backdrop-blur-sm rounded-2xl transition-all duration-700 ease-[0.22,1,0.36,1] hover:bg-white/10 hover:border-white/30 hover:-translate-y-3 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] cursor-pointer">
                      <div className="flex gap-1 mb-6">
                        {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < (review.rating || 5) ? 'fill-current text-white' : 'text-white/20'}`} />)}
                      </div>
                      <p className="font-serif-luxury text-xl sm:text-2xl font-light text-white mb-8 leading-relaxed transition-colors duration-700 ease-[0.22,1,0.36,1] group-hover:text-stone-200">"{review.comment || review.quote}"</p>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">{review.customerName || review.source}</p>
                        {review.productId && <p className="text-[10px] text-white/40 mt-1 cursor-pointer hover:text-white transition-colors duration-700 ease-[0.22,1,0.36,1]" onClick={() => router.push(`/products/${review.productId}`)}>View Product</p>}
                      </div>
                    </div>
                  ))}
                </HorizontalScroll>
              </div>
            </section>
            
            <ShortsViewer />
          </React.Fragment>
        );
      default:
        return null;
    }
  };

  const order = finalSectionOrder?.length > 0 ? finalSectionOrder.filter((k: string) => k !== 'about') : ['hero', 'categories', 'suggestions', 'offers', 'reviews'];

  return (
    <div className="flex flex-col bg-white">
      {order.map((key: string) => renderSection(key))}


      {/* Branches Section */}
      {branches && branches.length > 0 && (
        <section className="py-4 sm:py-5 border-t border-stone-100 bg-[#FAFAFA]">
          <div className="w-full max-w-[5120px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center mb-4 sm:mb-6">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-500 mb-4">Our Presence</span>
              <h2 className="font-serif-luxury text-4xl text-stone-900">Visit Our Boutiques</h2>
            </div>
            <HorizontalScroll arrowTop="top-1/2" theme="light" gapClass="gap-6">
              {branches.map(branch => (
                <div key={branch.id} className="group snap-center shrink-0 w-[85vw] sm:w-[380px] bg-[#faf9f8] p-10 border border-stone-200 flex flex-col justify-between relative overflow-hidden transition-all duration-700 hover:shadow-2xl hover:border-[#800020]/20 cursor-default rounded-[25px]">
                  {/* Luxury Inner Frame */}
                  <div className="absolute inset-2 border border-stone-200/50 rounded-[20px] pointer-events-none group-hover:border-[#800020]/10 transition-colors duration-700 ease-[0.22,1,0.36,1]"></div>
                  
                  {/* Decorative Gradient Blob */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#800020] opacity-[0.02] rounded-bl-full group-hover:scale-125 transition-transform duration-1000 ease-out pointer-events-none"></div>

                  {branch.status && (
                    <div className="absolute top-8 right-8 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-stone-100 shadow-sm z-10">
                      <span className={`w-1.5 h-1.5 rounded-full ${(branch.status === 'closed' || branch.status === 'holiday') ? 'bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.4)]' : 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)] animate-pulse'}`}></span>
                      <span className="text-[9px] uppercase tracking-[0.15em] font-bold text-stone-600">{branch.status}</span>
                    </div>
                  )}
                  
                  <div className="mb-10 pr-16 relative z-10">
                    <h3 className="font-serif-luxury text-3xl text-stone-900 mb-2 group-hover:text-[#800020] transition-colors duration-700 ease-[0.22,1,0.36,1]">{branch.name}</h3>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400">{branch.location}</p>
                  </div>
                  
                  <div className="space-y-5 text-xs text-stone-600 relative z-10">
                    <div className="flex items-start gap-4">
                      <MapPin className="w-4 h-4 shrink-0 text-stone-300 mt-0.5" />
                      <p className="leading-relaxed font-light">{branch.address}</p>
                    </div>
                    
                    <div className="w-full h-[1px] bg-stone-200/50"></div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 shrink-0 text-stone-300" />
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold">Hours</span>
                          <span className="font-medium">{branch.openTime || '10:00 AM'} - {branch.closeTime || '7:00 PM'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 shrink-0 text-stone-300" />
                        <div className="flex flex-col">
                          <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold">Call</span>
                          <span className="font-medium tracking-wide">{branch.phone}</span>
                        </div>
                      </div>
                    </div>

                    {branch.inChargeName && (
                      <>
                        <div className="w-full h-[1px] bg-stone-200/50"></div>
                        <div className="flex items-center gap-4">
                          <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                            <span className="text-stone-300 text-[14px]">👤</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold">Boutique Manager</span>
                            <span className="font-medium text-stone-800">{branch.inChargeName}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {branch.mapLink && (
                    <div className="mt-10 pt-6 relative z-10">
                      <a href={branch.mapLink} target="_blank" rel="noreferrer" className="group/btn relative w-full flex items-center justify-center gap-3 bg-stone-900 text-white px-6 py-4 rounded-sm overflow-hidden transition-all hover:shadow-lg">
                        <div className="absolute inset-0 bg-[#800020] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-700 ease-[0.22,1,0.36,1]"></div>
                        <span className="relative z-10 text-[10px] font-bold uppercase tracking-[0.2em]">Get Directions</span>
                        <ArrowRight className="relative z-10 w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-700 ease-[0.22,1,0.36,1]" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </HorizontalScroll>
          </div>
        </section>
      )}

    </div>
  );
};
