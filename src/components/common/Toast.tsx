import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  return (
    <aside aria-label="Notifications" className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              id={toast.id}
              className="pointer-events-auto bg-[#1A1918] text-white p-4 rounded-sm shadow-md border border-white/10 flex items-start gap-3.5 backdrop-blur-md"
            >
              <div className="shrink-0 mt-0.5">
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-[#800020] bg-white rounded-full p-0.5" />}
                {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                  {toast.title}
                </p>
                <p className="text-sm text-stone-100 mt-0.5 leading-snug">
                  {toast.message}
                </p>
              </div>
              <button
                id={`close-${toast.id}`}
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-stone-400 hover:text-white transition-colors p-1"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </aside>
  );
};
