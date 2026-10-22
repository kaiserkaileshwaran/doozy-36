'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Search, X, ArrowRight, Sparkles, TrendingUp, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EmptyState } from './EmptyState';

export const SearchModal: React.FC = () => {
  const router = useRouter();

  const {
    searchModalOpen,
    setSearchModalOpen,
    products,
    setSelectedProduct,
    formatPrice,
    setFilter
  } = useStore();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [searchModalOpen]);

  const filteredProducts = query.trim()
    ? products.filter(
        p =>
          (p.title && p.title.toLowerCase().includes(query.toLowerCase())) ||
          (p.subtitle && p.subtitle.toLowerCase().includes(query.toLowerCase())) ||
          (p.category && p.category.toLowerCase().includes(query.toLowerCase())) ||
          (p.craft && p.craft.toLowerCase().includes(query.toLowerCase())) ||
          (p.fabric && p.fabric.toLowerCase().includes(query.toLowerCase())) ||
          (p.tags && Array.isArray(p.tags) && p.tags.some(t => t && t.toLowerCase().includes(query.toLowerCase()))) ||
          (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const trendingSearches = [
    'Chanderi Chudithar Set',
    'Lucknowi Chikankari Angrakha',
    'Burgundy Silk Co-ord',
    'Bandhani Tiered Dress',
    'Banarasi Katan Dupatta',
    'Mulmul Daily Kurti',
    'Gota Patti Anarkali Suit'
  ];

  const handleSelectProduct = (product: typeof products[0]) => {
    setSelectedProduct(product);
    setSearchModalOpen(false);
    router.push('/products/' + product.id);
  };

  // Handle hardware back button for mobile modal
  const handleClose = () => {
    if (window.location.hash === '#search') {
      window.history.back();
    } else {
      setSearchModalOpen(false);
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchModalOpen) handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchModalOpen]);

  React.useEffect(() => {
    if (searchModalOpen) {
      window.history.pushState({ modal: 'search' }, '', '#search');
    } else {
      if (window.location.hash === '#search') {
        window.history.back();
      }
    }

    const handlePopState = (e: PopStateEvent) => {
      if (searchModalOpen && window.location.hash !== '#search') {
        setSearchModalOpen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [searchModalOpen, setSearchModalOpen]);

  return (
    <AnimatePresence>
      {searchModalOpen && (
        <aside aria-label="Search collection modal" className="fixed inset-0 z-[200] overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-md"
          />

          <div className="relative min-h-screen flex items-start justify-center p-4 sm:p-6 md:p-12">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-4xl bg-[#FDFBF7] rounded-sm shadow-[0_20px_60px_-15px_rgba(128,0,32,0.2)] overflow-hidden border-2 border-[#800020]/10 mt-16 sm:mt-24"
            >
              {/* Search Header Bar */}
              <div className="p-4 sm:p-6 bg-white border-b border-stone-200">
                <div className="flex items-center gap-3 bg-stone-50 border-2 border-[#800020]/20 focus-within:border-[#800020] focus-within:bg-white rounded-full px-4 sm:px-6 py-2 sm:py-3 transition-colors shadow-inner">
                  <Search className="w-5 h-5 sm:w-6 sm:h-6 text-[#800020] shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search kurtas, chudithar sets, co-ords, banarasi silk..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && query.trim()) {
                        setFilter(p => ({ ...p, searchQuery: query.trim(), category: 'All' }));
                        setSearchModalOpen(false);
                        router.push('/products');
                      }
                    }}
                    className="w-full bg-transparent text-base sm:text-xl font-serif-luxury text-stone-900 placeholder-stone-400 focus:outline-none"
                  />
                  <button
                    id="close-search-modal-btn"
                    onClick={handleClose}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-stone-200/50 hover:bg-stone-200 flex items-center justify-center text-stone-500 hover:text-[#800020] transition-colors shrink-0 cursor-pointer"
                    aria-label="Close search"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                {query.trim() === '' ? (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">
                        <TrendingUp className="w-3.5 h-3.5 text-[#800020]" />
                        <span>Trending Ethnic Searches</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {trendingSearches.map(term => (
                          <button
                            key={term}
                            onClick={() => {
                              setQuery(term);
                              setFilter(p => ({ ...p, searchQuery: term, category: 'All' }));
                              setSearchModalOpen(false);
                              router.push('/products');
                            }}
                            className="text-xs bg-white hover:bg-[#800020] hover:text-white text-stone-700 px-4 py-2 rounded-full border border-stone-200 transition-all font-medium"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>Curated Bestsellers</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {products.slice(0, 4).map(prod => (
                          <div
                            key={prod.id}
                            onClick={() => handleSelectProduct(prod)}
                            className="flex items-center gap-3 p-3 rounded-sm bg-white border border-stone-200/80 hover:border-[#800020] hover:shadow-md transition-all cursor-pointer group"
                          >
                            <img
                              src={prod.images?.[0]}
                              alt={prod.title}
                              className="w-14 h-18 object-cover rounded-sm border border-stone-200 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-stone-900 truncate group-hover:text-[#800020]">
                                {prod.title}
                              </h4>
                              <p className="text-[10px] text-stone-500 truncate">{prod.subtitle}</p>
                              <p className="text-xs font-serif-luxury font-bold text-[#800020] mt-1">
                                {formatPrice(prod.price)}
                              </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-[#800020] transition-colors shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-stone-500 mb-4">
                      Showing {filteredProducts.length} results for "<strong className="text-stone-900">{query}</strong>"
                    </p>

                    {filteredProducts.length === 0 ? (
                      <EmptyState
                        type="search"
                        title="No matching ensembles found"
                        description={`We couldn't find any products matching "${query}". Try searching by fabric (e.g. Chanderi, Mulmul) or category (Kurtas, Chudithar, Co-ords).`}
                        actionText="Clear Search"
                        onAction={() => setQuery('')}
                      />
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {filteredProducts.map(product => (
                          <div
                            key={product.id}
                            onClick={() => handleSelectProduct(product)}
                            className="flex items-center gap-3 p-3 rounded-sm bg-white border border-stone-200 hover:border-[#800020] hover:shadow-md transition-all cursor-pointer group"
                          >
                            <img
                              src={product.images?.[0]}
                              alt={product.title}
                              className="w-16 h-20 object-cover rounded-sm border border-stone-200 shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 mb-0.5">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-[#800020] bg-[#800020]/10 px-2 py-0.5 rounded-full">
                                  {product.category}
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-stone-900 truncate group-hover:text-[#800020]">
                                {product.title}
                              </h4>
                              <p className="text-[10px] text-stone-500 line-clamp-1">{product.subtitle}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-serif-luxury font-bold text-[#800020]">
                                  {formatPrice(product.price)}
                                </span>
                                {product.compareAtPrice && (
                                  <span className="text-[10px] text-stone-400 line-through">
                                    {formatPrice(product.compareAtPrice)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-[#800020] transition-colors shrink-0" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </aside>
      )}
    </AnimatePresence>
  );
};
