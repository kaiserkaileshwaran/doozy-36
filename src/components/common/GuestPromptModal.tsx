import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { useStore } from '../../context/StoreContext';
import { LogIn, UserPlus, X } from 'lucide-react';

export const GuestPromptModal: React.FC = () => {
  const { guestPromptOpen, setGuestPromptOpen, setCartDrawerOpen } = useStore();
  const router = useRouter();

  if (!guestPromptOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setGuestPromptOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative bg-white rounded-sm p-6 sm:p-8 max-w-sm w-full shadow-md z-10 text-center"
        >
          <button
            onClick={() => setGuestPromptOpen(false)}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-[#800020]" />
          </div>
          
          <h3 className="font-serif-luxury text-2xl font-bold text-stone-900 mb-2">
            You are logged out
          </h3>
          <p className="text-sm text-stone-600 mb-6">
            Kindly log in to access your curated wishlist, save your selections permanently, and enjoy exclusive member perks.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                setGuestPromptOpen(false); setCartDrawerOpen(false);
                router.push('/auth');
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#800020] hover:bg-[#5c0017] text-white py-3.5 rounded-sm font-bold text-sm tracking-wide transition-all shadow-md active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              Sign In to DOOZY
            </button>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
