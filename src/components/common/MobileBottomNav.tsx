'use client';
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Heart, ShoppingBag, User, Search } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const MobileBottomNav: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount, currentUser, setSearchModalOpen } = useStore();

  if (pathname?.startsWith('/admin')) return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-stone-200 z-[90] pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16 px-2">
        <button 
          onClick={() => router.push('/')} 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${pathname === '/' ? 'text-[#800020]' : 'text-stone-500 hover:text-stone-900'}`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Home</span>
        </button>

        <button 
          onClick={() => setSearchModalOpen(true)} 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors text-stone-500 hover:text-stone-900`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Search</span>
        </button>

        <button 
          onClick={() => router.push('/wishlist')} 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${pathname === '/wishlist' ? 'text-[#800020]' : 'text-stone-500 hover:text-stone-900'}`}
        >
          <Heart className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Wishlist</span>
        </button>

        <button 
          onClick={() => router.push('/cart')} 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative ${pathname === '/bag' ? 'text-[#800020]' : 'text-stone-500 hover:text-stone-900'}`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-[#800020] text-white text-[8px] font-bold rounded-full flex items-center justify-center border border-white">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest">Cart</span>
        </button>

        <button 
          onClick={() => router.push(currentUser ? (currentUser.role === 'admin' ? '/admin' : '/account') : '/auth')} 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${(pathname === '/account' || pathname === '/auth') ? 'text-[#800020]' : 'text-stone-500 hover:text-stone-900'}`}
        >
          <User className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-widest">Profile</span>
        </button>
      </div>
    </div>
  );
};
