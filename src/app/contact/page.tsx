'use client';
import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { MapPin, Clock, Phone, Navigation } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { MobileHeader } from '../../components/common/MobileHeader';
import { Footer } from '../../components/common/Footer';

export default function ContactPage() {
  const { branches } = useStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => { setMounted(true); }, []);
  
  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans flex flex-col">
      <Header />
      <MobileHeader />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 w-full max-w-[5120px] mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#800020]">Get in Touch</span>
          <h1 className="font-serif-luxury text-4xl md:text-5xl font-bold text-stone-900">Visit Our Boutiques</h1>
          <p className="text-stone-500 leading-relaxed text-sm">
            Experience the exquisite craftsmanship of DOOZY in person. Our style consultants are ready to assist you in finding your perfect outfit.
          </p>
        </div>

        {branches.length === 0 ? (
          <div className="text-center text-stone-500 py-12">No boutique locations available at the moment.</div>
        ) : branches.length === 1 ? (
          <div className="max-w-xl mx-auto">
            <BranchCard branch={branches[0]} />
          </div>
        ) : (
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 touch-pan-x hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {branches.map(branch => (
              <div key={branch.id} className="snap-start shrink-0 w-[85vw] sm:w-[400px]">
                <BranchCard branch={branch} />
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

const BranchCard = ({ branch }: { branch: any }) => (
  <div className="bg-white rounded-sm border border-stone-200 shadow-sm overflow-hidden h-full flex flex-col">
    <div className="bg-[#800020] text-white p-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 flex items-center justify-center">
        <MapPin className="w-48 h-48 -rotate-12" />
      </div>
      <div className="relative z-10 space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-200">{branch.location}</span>
        <h3 className="font-serif-luxury text-2xl font-bold">{branch.name}</h3>
      </div>
    </div>
    
    <div className="p-8 space-y-6 flex-1 flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex gap-4 items-start">
          <MapPin className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
          <p className="text-sm text-stone-600 leading-relaxed">{branch.address}</p>
        </div>
        
        <div className="flex gap-4 items-center">
          <Clock className="w-5 h-5 text-stone-400 shrink-0" />
          <div className="text-sm text-stone-600">
            <span className="font-bold text-stone-900">Open:</span> {branch.openTime || '09:00 AM'} - {branch.closeTime || '06:00 PM'}
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <Phone className="w-5 h-5 text-stone-400 shrink-0" />
          <div className="text-sm text-stone-600">
            <p><span className="font-bold text-stone-900">Desk:</span> {branch.phone}</p>
            {branch.inChargeNumber && <p><span className="font-bold text-stone-900">Manager:</span> {branch.inChargeNumber}</p>}
          </div>
        </div>
      </div>

      {branch.mapLink && (
        <a 
          href={branch.mapLink} 
          target="_blank" 
          rel="noreferrer"
          className="w-full flex items-center justify-center gap-2 py-4 bg-stone-50 hover:bg-stone-100 text-[#800020] rounded-sm font-bold text-xs uppercase tracking-wider transition-colors border border-stone-200"
        >
          <Navigation className="w-4 h-4" /> Get Directions
        </a>
      )}
    </div>
  </div>
);
