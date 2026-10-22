'use client';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { usePathname } from 'next/navigation';
import { Sparkles, ArrowRight, ShieldCheck, Truck, RefreshCw, Award, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    currentUser,
 setFilter, showToast, branches, categories } = useStore();
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      showToast('Invalid Email', 'Please enter a valid email address.', 'error');
      return;
    }
    setSubscribed(true);
    showToast('Subscribed to DOOZY Gazette', 'You will receive private previews and festive collection invitations.', 'success');
    setEmailInput('');
  };



  if (pathname?.startsWith('/admin')) return null;



  return (
    <footer className="bg-[#141312] text-stone-300 pt-6 sm:pt-8 pb-24 lg:pb-12 border-t border-stone-800">
      {/* Brand Value Pillars */}
      <div className="w-full max-w-[5120px] mx-auto px-4 sm:px-6 lg:px-8 pb-14 border-b border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-amber-300">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-white text-xs font-bold uppercase tracking-wider">
                Pan-India Express
              </h5>
              <p className="text-stone-400 text-xs mt-1 leading-relaxed">
                Free courier shipping on orders above ₹2,500 with real-time BlueDart tracking.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-amber-300">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-white text-xs font-bold uppercase tracking-wider">
                Certified Handloom Mark
              </h5>
              <p className="text-stone-400 text-xs mt-1 leading-relaxed">
                Pure Chanderi silk, Banarasi zari, Lucknowi Chikankari & organic Mulmul.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-amber-300">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-white text-xs font-bold uppercase tracking-wider">
                7-Day Easy Exchanges
              </h5>
              <p className="text-stone-400 text-xs mt-1 leading-relaxed">
                Hassle-free doorstep size exchanges and fit assistance.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-white text-xs font-bold uppercase tracking-wider">
                Artisan Heritage
              </h5>
              <p className="text-stone-400 text-xs mt-1 leading-relaxed">
                Fair-trade slow couture directly honoring master Indian weavers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="w-full max-w-[5120px] mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
        {/* Decorative backdrop fade */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#800020] opacity-[0.03] rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 mb-20">
        {/* Brand Column */}
        <div className="space-y-6 relative z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/footer_logo.jpeg" alt="DOOZY" className="h-20 w-auto object-contain" />
          <p className="text-stone-400 text-[13px] leading-relaxed max-w-sm">
            <span className="text-amber-50 italic">DOOZY</span> is a premium churidar atelier from India. Every piece is exquisitely tailored by our master artisans to celebrate timeless royalty and rich heritage.
          </p>
          <div className="pt-4 flex flex-wrap gap-2.5">
            {branches.map(branch => {
              const isClosed = branch.status === 'closed' || branch.status === 'holiday';
              return (
                <div key={branch.id} className="flex items-center gap-2 text-[10px] text-stone-300 tracking-[0.15em] font-medium uppercase border border-white/5 bg-white/5 backdrop-blur-sm px-3.5 py-2 rounded-full shadow-sm hover:bg-white/10 transition-colors">
                  <span className={`w-1.5 h-1.5 rounded-full ${isClosed ? 'bg-rose-500/80 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse'}`}></span>
                  {branch.name}
                </div>
              );
            })}
          </div>
        </div>
        {/* Main Branch Detail */}
        {(() => {
          const mainBranch = branches.find(b => b.isMainBranch);
          if (!mainBranch) return <div className="space-y-3 relative z-10"></div>;
          
          return (
            <div className="relative z-10 flex flex-col h-full justify-start">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 mb-6 flex items-center gap-4">
                <span className="w-8 h-[1px] bg-stone-800"></span>
                Headquarters
              </h4>
              <div className="p-7 border border-white/5 bg-gradient-to-br from-[#1a1918] to-transparent relative overflow-hidden group rounded-sm shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500 opacity-5 rounded-bl-full group-hover:scale-125 transition-transform duration-1000 ease-out pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#800020] opacity-5 rounded-tr-full group-hover:scale-125 transition-transform duration-1000 ease-out pointer-events-none"></div>
                
                <h5 className="font-serif-luxury text-2xl text-amber-50 mb-3">{mainBranch.name}</h5>
                <div className="space-y-3 text-xs text-stone-400 leading-relaxed font-light">
                  <p className="flex items-start gap-3">
                    <span className="mt-0.5 text-stone-600">📍</span>
                    <span className="flex-1">{mainBranch.address}</span>
                  </p>
                  
                  {mainBranch.inChargeName && (
                    <p className="flex items-center gap-3 pt-2 border-t border-white/5">
                      <span className="text-stone-600">👤</span>
                      <span className="flex-1 text-stone-300">{mainBranch.inChargeName}</span>
                    </p>
                  )}
                  
                  {(mainBranch.inChargeNumber || mainBranch.phone) && (
                    <p className="flex items-center gap-3">
                      <span className="text-stone-600">📞</span>
                      <span className="flex-1 text-stone-300 tracking-wider">{mainBranch.inChargeNumber || mainBranch.phone}</span>
                    </p>
                  )}
                </div>

                {mainBranch.mapLink && (
                  <div className="mt-6 pt-5 border-t border-white/5">
                    <a href={mainBranch.mapLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/80 hover:text-amber-400 transition-colors group/link">
                      <span>Get Directions</span>
                      <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                    </a>
                  </div>
                )}
              </div>
            </div>
            );
          })()}
      </div>
        </div>

      {/* Copyright & Disclaimer */}

      <div className="w-full max-w-[5120px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-white/10 text-center sm:flex sm:justify-between sm:items-center text-xs text-stone-500">
        <p>© 2026 DOOZY Luxury Ethnic Atelier Pvt Ltd. All rights reserved.</p>
        <p className="mt-2 sm:mt-0 flex items-center justify-center gap-1">
          Designed with <Heart className="w-3 h-3 text-[#800020] fill-[#800020]" /> for the modern Indian muse.
        </p>
      </div>
    </footer>
  );
};
