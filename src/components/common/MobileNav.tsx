'use client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useStore } from '../../context/StoreContext';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DoozyLogo } from './DoozyLogo';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { currentUser, categories, products } = useStore();

  if (currentUser?.role === 'admin') return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <aside className="lg:hidden fixed inset-0 z-[9999] overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute left-0 top-0 bottom-0 w-4/5 max-w-sm bg-[#800020] text-white flex flex-col shadow-2xl overflow-y-auto"
          >
            <div className="p-6 flex items-center justify-between border-b border-white/10 shrink-0">
              <DoozyLogo theme="white" className="w-24" />
              <button onClick={onClose} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 px-6 py-8 flex flex-col gap-8">
              <div>
                <h3 className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/50 mb-6">Categories</h3>
                <div className="space-y-6">
                  {categories.map(cat => (
                    <button 
                      key={cat.id} 
                      onClick={() => { router.push(`/collections/${cat.name.toLowerCase()}`); onClose(); }}
                      className="flex items-center gap-4 w-full group text-left"
                    >
                      {cat.image && (
                        <img src={cat.image} alt={cat.name} className="w-12 h-12 rounded-lg object-cover bg-white/5" />
                      )}
                      <div>
                        <span className="block text-lg font-bold font-serif-luxury text-white group-hover:text-white/80 transition-colors">
                          {cat.name}
                        </span>
                        <span className="block text-white/70 text-[8px] uppercase tracking-widest">{products.filter(p => p.category === cat.name).length} Designs</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </aside>
      )}
    </AnimatePresence>
  );
};
