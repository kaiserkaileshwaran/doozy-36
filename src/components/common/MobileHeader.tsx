
'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { usePathname } from 'next/navigation';
import { Search, ShoppingBag, User, Menu, X, Heart, Package } from 'lucide-react';
import { DoozyLogo } from './DoozyLogo';
import { motion, AnimatePresence } from 'motion/react';
import { MobileNav } from './MobileNav';

export const MobileHeader: React.FC = () => {
  const router = useRouter();
  const { cartCount, setSearchModalOpen, currentUser, announcements } = useStore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
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
      <header className="lg:hidden fixed top-0 left-0 w-full z-[100] bg-white border-b border-stone-200">
        {/* Top Utility Bar */}
        <div className="bg-[#800020] text-white text-[9px] font-bold tracking-[0.2em] uppercase h-8 px-4 flex justify-center items-center relative overflow-hidden">
          {visibleAnnouncements.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={announcementIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute text-center truncate w-full px-4"
              >
                {visibleAnnouncements[announcementIndex]?.text || visibleAnnouncements[0]?.text}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="absolute text-center truncate w-full px-4">FREE SHIPPING OVER ₹5,000</div>
          )}
        </div>

        <div className="flex items-center justify-between h-16 px-4">
          <button onClick={() => setIsNavOpen(true)} className="p-2 -ml-2 text-stone-900 hover:text-[#800020] cursor-pointer">
            <Menu className="w-5 h-5" />
          </button>

          <div className="absolute left-1/2 -translate-x-1/2">
            <button onClick={() => router.push('/')} className="cursor-pointer">
              <DoozyLogo size="sm" />
            </button>
          </div>

          <button onClick={() => router.push('/track-orders')} className="p-2 -mr-2 text-stone-900 hover:text-[#800020] transition-colors cursor-pointer">
            <Package className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      <MobileNav isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      <div className="lg:hidden h-[96px] w-full"></div>
    </>
  );
};
