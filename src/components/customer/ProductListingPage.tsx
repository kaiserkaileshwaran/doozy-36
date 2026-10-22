
'use client';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../common/ProductCard';
import { 
  SlidersHorizontal, 
  ChevronDown, 
  X, 
  Heart,
  ShoppingBag,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ProductListingPage: React.FC<{ initialCategory?: string }> = ({ initialCategory }) => {
  const router = useRouter();
  const { 
    products, 
    filter, 
    setFilter,
    resetFilter,
    addToCart,
    toggleWishlist,
    wishlist,
    categories
  } = useStore();

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>('category');

  useEffect(() => {
    if (initialCategory) {
      setFilter(p => ({ ...p, category: decodeURIComponent(initialCategory) }));
    } else {
      setFilter(p => ({ ...p, category: 'All' }));
    }
  }, [initialCategory, setFilter]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    const categoryToFilter = filter.category;
    if (categoryToFilter && categoryToFilter !== 'All') {
      result = result.filter(p => p.category === categoryToFilter);
    }
    if (filter.searchQuery?.trim()) {
      const q = filter.searchQuery.toLowerCase();
      result = result.filter(p => 
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.craft && p.craft.toLowerCase().includes(q)) ||
        (p.fabric && p.fabric.toLowerCase().includes(q)) ||
        (p.tags && Array.isArray(p.tags) && p.tags.some(t => t && t.toLowerCase().includes(q)))
      );
    }
    if (filter.minPrice > 0) result = result.filter(p => p.price >= filter.minPrice);
    if (filter.maxPrice < 50000) result = result.filter(p => p.price <= filter.maxPrice);
    if (filter.sizes.length > 0) {
      result = result.filter(p => p.sizes.some(s => filter.sizes.includes(s)));
    }
    if (filter.sortBy === 'price-low') result.sort((a,b) => a.price - b.price);
    if (filter.sortBy === 'price-high') result.sort((a,b) => b.price - a.price);
    if (filter.sortBy === 'newest') {
      result.sort((a,b) => {
        // Sort by isNew flag first, then by timestamp in ID
        if (a.isNew !== b.isNew) return b.isNew ? 1 : -1;
        const getT = (id: string) => { const p = id.split('-'); return p.length > 1 ? parseInt(p[1]) : 0; };
        return getT(b.id) - getT(a.id);
      });
    }
    if (filter.sortBy === 'featured') {
      result.sort((a,b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }
    return result;
  }, [products, filter, initialCategory]);

  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

  const toggleSize = (sz: string) => {
    setFilter(prev => {
      const sizes = prev.sizes.includes(sz) ? prev.sizes.filter(s => s !== sz) : [...prev.sizes, sz];
      return { ...prev, sizes };
    });
  };

  const handleProductClick = (id: string) => {
    router.push('/products/' + id);
  };

  return (
    <div className="bg-white min-h-screen">
      
      {/* Editorial Header */}
      <div className="bg-stone-50 py-16 border-b border-stone-200">
        <div className="w-full max-w-[5120px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-3">
            {filter.category === 'All' ? 'The Collection' : filter.category}
          </span>
          <h1 className="font-serif-luxury text-4xl sm:text-5xl text-stone-900 mb-4">
            {filter.category === 'All' ? 'All Pieces' : filter.category}
          </h1>
          <p className="text-stone-500 text-sm max-w-xl">
            Explore our curated selection of trans-seasonal styles, designed to elevate your everyday and extraordinary moments.
          </p>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-8 sticky top-28 self-start max-h-[calc(100vh-120px)] overflow-y-auto hide-scrollbar">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-900">Filters</h2>
            <button onClick={resetFilter} className="text-[10px] uppercase tracking-wider text-stone-500 hover:text-stone-900">Clear All</button>
          </div>

          <div className="space-y-6">
            
            {/* Category Accordion */}
            <div className="border-b border-stone-100 pb-4">
              <button onClick={() => setActiveAccordion(a => a === 'category' ? null : 'category')} className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-widest text-stone-900 mb-4">
                Categories
                <ChevronDown className={`w-4 h-4 transition-transform ${activeAccordion === 'category' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {activeAccordion === 'category' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <ul className="space-y-2.5 pt-2">
                      <li>
                        <button onClick={() => setFilter(p => ({...p, category: 'All'}))} className={`text-xs ${filter.category === 'All' ? 'font-bold text-stone-900' : 'text-stone-500 hover:text-stone-900'}`}>All Categories</button>
                      </li>
                      {categories.map(cat => (
                        <li key={cat.id}>
                          <button onClick={() => setFilter(p => ({...p, category: cat.name}))} className={`text-xs ${filter.category === cat.name ? 'font-bold text-stone-900' : 'text-stone-500 hover:text-stone-900'}`}>{cat.name}</button>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sizes */}
            <div className="border-b border-stone-100 pb-4">
              <button onClick={() => setActiveAccordion(a => a === 'sizes' ? null : 'sizes')} className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-widest text-stone-900 mb-4">
                Size
                <ChevronDown className={`w-4 h-4 transition-transform ${activeAccordion === 'sizes' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {activeAccordion === 'sizes' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      {allSizes.map(sz => (
                        <button key={sz} onClick={() => toggleSize(sz)} className={`py-2 text-[10px] font-bold uppercase border ${filter.sizes.includes(sz) ? 'bg-stone-900 text-white border-stone-900' : 'bg-transparent text-stone-600 border-stone-200 hover:border-stone-400'}`}>
                          {sz}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Price */}
            <div className="border-b border-stone-100 pb-4">
              <button onClick={() => setActiveAccordion(a => a === 'price' ? null : 'price')} className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-widest text-stone-900 mb-4">
                Price Range
                <ChevronDown className={`w-4 h-4 transition-transform ${activeAccordion === 'price' ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {activeAccordion === 'price' && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="pt-2 space-y-4">
                      <div className="flex justify-between text-xs text-stone-600 font-bold">
                        <span>₹0</span>
                        <span>₹{filter.maxPrice}</span>
                      </div>
                      <input type="range" min="0" max="50000" step="100" value={filter.maxPrice} onChange={(e) => setFilter(p => ({...p, maxPrice: Number(e.target.value)}))} className="w-full accent-stone-900" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <button onClick={() => setMobileFilterOpen(true)} className="lg:hidden flex items-center gap-2 text-xs font-bold uppercase tracking-widest border border-stone-200 px-4 py-2 hover:bg-stone-50">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
            <div className="text-xs text-stone-500 uppercase tracking-widest font-bold hidden sm:block">
              {filteredProducts.length} Results
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500 hidden sm:block">Sort By:</label>
              <select value={filter.sortBy} onChange={(e) => setFilter(p => ({...p, sortBy: e.target.value as any}))} className="bg-transparent border-b border-stone-300 py-1 pr-6 text-xs font-bold uppercase tracking-widest text-stone-900 focus:outline-none focus:border-stone-900 cursor-pointer">
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center text-center">
              <h3 className="font-serif-luxury text-3xl text-stone-900 mb-4">No pieces found</h3>
              <p className="text-stone-500 text-sm mb-8">Refine your filters to explore more of the collection.</p>
              <button onClick={resetFilter} className="bg-stone-900 text-white px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors">Clear Filters</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[1920px]:grid-cols-6 min-[2560px]:grid-cols-8 gap-x-4 sm:gap-x-6 gap-y-12">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Modal */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileFilterOpen(false)} className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 lg:hidden" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed inset-x-0 bottom-0 max-h-[90vh] bg-white z-[60] lg:hidden flex flex-col shadow-2xl">
              <div className="p-6 border-b border-stone-100 flex items-center justify-between shrink-0">
                <h3 className="font-serif-luxury text-xl text-stone-900">Filters</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="text-stone-400 hover:text-stone-900">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-4">Categories</h4>
                  <div className="space-y-3">
                    <button onClick={() => setFilter(p => ({...p, category: 'All'}))} className={`block text-sm ${filter.category === 'All' ? 'font-bold text-stone-900' : 'text-stone-600'}`}>All Categories</button>
                    {categories.map(cat => (
                      <button key={cat.id} onClick={() => setFilter(p => ({...p, category: cat.name}))} className={`block text-sm ${filter.category === cat.name ? 'font-bold text-stone-900' : 'text-stone-600'}`}>{cat.name}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-4">Sizes</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {allSizes.map(sz => (
                      <button key={sz} onClick={() => toggleSize(sz)} className={`py-2 text-[10px] font-bold uppercase border ${filter.sizes.includes(sz) ? 'bg-stone-900 text-white border-stone-900' : 'bg-transparent text-stone-600 border-stone-200'}`}>
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-500 mb-4">Maximum Price: ₹{filter.maxPrice}</h4>
                  <input type="range" min="0" max="50000" step="100" value={filter.maxPrice} onChange={(e) => setFilter(p => ({...p, maxPrice: Number(e.target.value)}))} className="w-full accent-stone-900" />
                </div>
              </div>

              <div className="p-6 border-t border-stone-100 flex gap-4 bg-stone-50 shrink-0">
                <button onClick={resetFilter} className="flex-1 py-4 border border-stone-200 text-stone-600 text-[11px] font-bold uppercase tracking-[0.2em] bg-white">Clear</button>
                <button onClick={() => setMobileFilterOpen(false)} className="flex-1 py-4 bg-stone-900 text-white text-[11px] font-bold uppercase tracking-[0.2em]">Show Results</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
