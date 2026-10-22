'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { usePathname } from 'next/navigation';
import { Search, User, ChevronDown, Heart, ShoppingBag, Package, ArrowRight } from 'lucide-react';
import { DoozyLogo } from './DoozyLogo';
import { motion, AnimatePresence } from 'motion/react';

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    currentUser,
    cartCount,
    setSearchModalOpen,
    categories,
    announcements,
    setFilter,
    products
  } = useStore();

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [announcementIndex, setAnnouncementIndex] = useState(0);

  const visibleAnnouncements = announcements.filter(a => !a.isHidden);

  useEffect(() => {
    setMounted(true);
    if (visibleAnnouncements.length > 1) {
      const interval = setInterval(() => {
        setAnnouncementIndex(prev => (prev + 1) % visibleAnnouncements.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [visibleAnnouncements.length]);

  if (pathname?.startsWith('/admin')) return null;

  return (
    <>
      <header className="hidden lg:block fixed top-0 left-0 w-full z-[100] bg-white border-b border-stone-200 transition-all duration-200 shadow-sm">
      
      {/* Top Utility Bar */}
      {visibleAnnouncements.length > 0 && (
        <div className="bg-[#800020] text-white text-[9px] font-bold tracking-[0.2em] uppercase h-9 flex justify-center items-center relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={announcementIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute text-center w-full px-4"
            >
              {visibleAnnouncements[announcementIndex]?.text || visibleAnnouncements[0]?.text}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Main Header */}
      <div className="w-full max-w-[5120px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left Logo */}
          <div className="shrink-0 flex items-center ">
            <button onClick={() => router.push('/')} className="cursor-pointer hover:opacity-80 transition-opacity">
              <DoozyLogo />
            </button>
          </div>

          {/* Desktop Navigation & Actions */}
          <nav className="flex items-center gap-6 xl:gap-8">
            <button onClick={() => setSearchModalOpen(true)} className="text-stone-900 hover:text-[#800020] transition-colors flex items-center gap-2 cursor-pointer">
              <Search className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Search</span>
            </button>
            
            <div 
              className="static py-8"
              onMouseEnter={() => setActiveMenu('collections')}
              onMouseLeave={() => { setActiveMenu(null); setHoveredCategory(null); }}
            >
              <button 
                onClick={() => { setFilter(prev => ({...prev, category: 'All'})); router.push('/products'); }}
                className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-900 hover:text-[#800020] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                Categories <ChevronDown className={`w-3 h-3 transition-transform ${activeMenu === 'collections' ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence mode="wait">
                {activeMenu === 'collections' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-full left-1/2 -translate-x-1/2 w-full max-w-[1000px] bg-[#fdfbf7] border border-stone-200 shadow-[0_40px_60px_-15px_rgba(0,0,0,0.1)] z-50 flex rounded-b-sm overflow-hidden min-h-[450px]"
                  >
                    {/* Left: Typography Grid of Categories (2/3 width) */}
                    <div className="w-2/3 p-10 pr-12 flex flex-col">
                      <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-200">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#800020] mb-2 block">Curated</span>
                          <h3 className="text-2xl font-serif-luxury text-stone-900">Explore All Collections</h3>
                        </div>
                        <button 
                          onClick={() => { setFilter(prev => ({...prev, category: 'All'})); router.push('/products'); setActiveMenu(null); }}
                          className="group flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-stone-900 hover:text-[#800020] transition-colors"
                        >
                          <span className="border-b border-stone-900 group-hover:border-[#800020] pb-1 transition-colors">Shop Everything</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-x-8 gap-y-6 max-h-[50vh] overflow-y-auto custom-scrollbar pr-4">
                        {[...categories].sort((a,b) => (a.order||0) - (b.order||0)).map(cat => (
                          <button
                            key={cat.id}
                            onMouseEnter={() => setHoveredCategory(cat.id)}
                            onClick={() => { setActiveMenu(null); setHoveredCategory(null); router.push('/categories/' + cat.name); }}
                            className="text-left group/cat flex flex-col justify-center"
                          >
                            <span className={`text-xs font-bold uppercase tracking-[0.1em] transition-colors ${hoveredCategory === cat.id ? 'text-[#800020]' : 'text-stone-700 group-hover/cat:text-[#800020]'}`}>
                              {cat.name}
                            </span>
                            <span className="block text-[9px] text-stone-400 mt-1 uppercase tracking-widest">{products.filter(p => p.category === cat.name).length} Designs</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Right: Hover Image Reveal (1/3 width) */}
                    <div className="w-1/3 bg-stone-100 relative overflow-hidden">
                      <AnimatePresence mode="wait">
                        <motion.img 
                          key={hoveredCategory || 'default'}
                          initial={{ opacity: 0, scale: 1.05 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                          src={hoveredCategory ? categories.find(c => c.id === hoveredCategory)?.image : (categories.length > 0 ? categories[0].image : '')}
                          alt="Category Preview"
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </AnimatePresence>
                      {!hoveredCategory && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-stone-900/40 pointer-events-none">
                           <h4 className="text-white font-serif-luxury text-2xl mb-2">The Doozy Atelier</h4>
                           <p className="text-white/80 text-[10px] uppercase tracking-[0.2em]">Hover to explore</p>
                        </div>
                      )}
                      {hoveredCategory && (
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent pointer-events-none"></div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => router.push('/track-orders')} className="text-stone-900 hover:text-[#800020] transition-colors flex items-center gap-2 cursor-pointer" title="Track Orders">
              <Package className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Track Order</span>
            </button>

            <button onClick={() => router.push('/wishlist')} className="text-stone-900 hover:text-[#800020] transition-colors flex items-center gap-2 cursor-pointer">
              <Heart className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Wishlist</span>
            </button>

            <button onClick={() => router.push('/cart')} className="text-stone-900 hover:text-[#800020] transition-colors flex items-center gap-2 cursor-pointer">
              <ShoppingBag className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Cart</span>
              {mounted && cartCount > 0 && (
                <span className="bg-[#800020] text-white text-[9px] font-bold px-1.5 h-4 rounded-full flex items-center justify-center -ml-1">
                  {cartCount}
                </span>
              )}
            </button>

            <button onClick={() => router.push(currentUser ? (currentUser.role === 'admin' ? '/admin' : '/account') : '/auth')} className="text-stone-900 hover:text-[#800020] transition-colors flex items-center gap-2 cursor-pointer">
              <User className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{currentUser ? 'Profile' : 'Sign In'}</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
      <div className="hidden lg:block" style={{ height: visibleAnnouncements.length > 0 ? "116px" : "80px" }}></div>
    </>
  );
};
