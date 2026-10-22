'use client';
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StoreProvider } from '../../context/StoreContext';
import { Header } from './Header';
import { MobileHeader } from './MobileHeader';
import { MobileNav } from './MobileNav';
import { Footer } from './Footer';
import { ToastContainer } from './Toast';
import dynamic from 'next/dynamic';
import { WhatsAppButton } from './WhatsAppButton';
import { DoozyLogo } from './DoozyLogo';
import { AnimatedDoozyLogo } from './AnimatedDoozyLogo';

// Dynamically import heavy UI modals to reduce initial JavaScript payload
const CartDrawer = dynamic(() => import('./CartDrawer').then(mod => mod.CartDrawer), { ssr: false });
const SearchModal = dynamic(() => import('./SearchModal').then(mod => mod.SearchModal), { ssr: false });
const GuestPromptModal = dynamic(() => import('./GuestPromptModal').then(mod => mod.GuestPromptModal), { ssr: false });
const PromotionModal = dynamic(() => import('./PromotionModal').then(mod => mod.PromotionModal), { ssr: false });
import { MobileBottomNav } from './MobileBottomNav';
import ScrollToTop from './ScrollToTop';
import { PushNotificationManager } from './PushNotificationManager';

export const ClientShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appReady, setAppReady] = React.useState(false);
  React.useEffect(() => {
    // Safety net in case the intro animation never reports completion
    const timer = setTimeout(() => {
      setAppReady(true);
    }, 2600);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Global Alt + LeftArrow for going back
      if (e.altKey && e.key === 'ArrowLeft') {
        window.history.back();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <StoreProvider>
      <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-stone-900 font-sans antialiased selection:bg-[#800020] selection:text-white">
        <AnimatePresence mode="wait">
          {!appReady ? (
            <motion.div 
              key="loading"
              className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#FDFBF7]"
              exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.05, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }}
            >
              <AnimatedDoozyLogo onComplete={() => setAppReady(true)} />
            </motion.div>
          ) : (
            <React.Fragment key="content">
              <ScrollToTop />
              <Header />
              <MobileHeader />
              <motion.div
                initial={{ opacity: 0, filter: 'blur(4px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 flex flex-col w-full"
                style={{ transform: 'none' }}
                onAnimationComplete={() => {
                  // Clean up filter so it doesn't break fixed/sticky children if we ever add them inside
                  const el = document.getElementById('main-content-motion');
                  if (el) el.style.filter = 'none';
                }}
                id="main-content-motion"
              >
                <main className="flex-1 pb-24 lg:pb-0 relative z-10 min-h-[85vh]">
                  {children}
                </main>
                <Footer />
              </motion.div>
              
              {/* Fixed Elements - Outside motion.div to prevent containing block issues */}
              <MobileBottomNav />
              <WhatsAppButton />
              <CartDrawer />
              <SearchModal />
              <ToastContainer />
              <PushNotificationManager />
              <GuestPromptModal />
              <PromotionModal />
            </React.Fragment>
          )}
        </AnimatePresence>
      </div>
    </StoreProvider>
  );
};
