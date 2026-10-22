'use client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Sparkles, ArrowRight, ShieldCheck, Award, Heart } from 'lucide-react';

export const EditorialView: React.FC = () => {
  const router = useRouter();
  
  return (
    <div className="w-full max-w-[5120px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
      {/* Manifesto Title */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#800020]/10 text-[#800020] text-xs font-bold uppercase tracking-widest">
          <Award className="w-3.5 h-3.5" />
          <span>The Atelier Craft Manifesto</span>
        </div>
        <h1 className="font-serif-luxury text-4xl sm:text-6xl text-stone-900 font-normal leading-tight">
          Heirloom Weaves, <br />
          <span className="italic text-[#800020]">Modern Indian Poise</span>
        </h1>
        <p className="text-stone-600 text-sm sm:text-base font-light leading-relaxed">
          DOOZY was born from an unyielding passion for India's incomparable handloom geography. From the royal pit looms of Chanderi and Varanasi to the delicate needlework of Lucknow and Bagru, we honor generational craftsmen while tailoring fluid styles for the visionary Indian woman.
        </p>
      </div>

      {/* Featured Large Imagery */}
      <div className="relative rounded-sm overflow-hidden shadow-md aspect-16/9 bg-stone-900">
        <img
          src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=85"
          alt="DOOZY Handloom Weaving Atelier"
          className="w-full h-full object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-transparent" />
        <div className="absolute bottom-8 left-8 text-white max-w-lg">
          <p className="font-serif-luxury text-2xl font-light">"Each weave carries centuries of songs, prayer, and pure artisanal devotion."</p>
          <span className="text-xs uppercase tracking-widest text-amber-200 mt-2 block">— DOOZY Master Weavers Guild, Varanasi & Chanderi</span>
        </div>
      </div>

      {/* Craft Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[#FAF9F6] p-8 rounded-sm border border-stone-200 space-y-3">
          <div className="w-10 h-10 rounded-sm bg-[#800020]/10 flex items-center justify-center text-[#800020] font-serif-luxury font-bold text-base">
            01
          </div>
          <h3 className="font-serif-luxury text-xl font-bold text-stone-900">
            Handloom Mark & Silk Mark
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Every Chanderi, Katan silk, and Mulmul yardage is authenticated with government Silk Mark certifications, assuring pure unadulterated natural yarns.
          </p>
        </div>

        <div className="bg-[#FAF9F6] p-8 rounded-sm border border-stone-200 space-y-3">
          <div className="w-10 h-10 rounded-sm bg-[#800020]/10 flex items-center justify-center text-[#800020] font-serif-luxury font-bold text-base">
            02
          </div>
          <h3 className="font-serif-luxury text-xl font-bold text-stone-900">
            Slow-Fashion Micro Runs
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            We operate in limited numbered batches. Our master artisans are paid fair wages and given the time required to weave pure metallic zari without industrial haste.
          </p>
        </div>

        <div className="bg-[#FAF9F6] p-8 rounded-sm border border-stone-200 space-y-3">
          <div className="w-10 h-10 rounded-sm bg-[#800020]/10 flex items-center justify-center text-[#800020] font-serif-luxury font-bold text-base">
            03
          </div>
          <h3 className="font-serif-luxury text-xl font-bold text-stone-900">
            Doorstep Fit Assurance
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Every ensemble includes our 7-day hassle-free doorstep size exchange. Need customized sleeve lengths or waist adjustments? Our concierge is on standby.
          </p>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-[#1C1B1A] text-white p-8 sm:p-12 rounded-sm text-center space-y-6">
        <h2 className="font-serif-luxury text-3xl sm:text-4xl font-normal">
          Immerse Yourself In Handcrafted Splendor
        </h2>
        <p className="text-stone-300 text-sm max-w-md mx-auto">
          Explore our Festive Kurtas, Chudithar sets, and fluid modern Co-ords.
        </p>
        <button
          onClick={() => router.push('/products')}
          className="bg-[#800020] hover:bg-[#5c0017] text-white px-9 py-4 rounded-sm text-xs font-bold uppercase tracking-widest transition-all shadow-sm hover:scale-105 cursor-pointer"
        >
          Explore Our Products
        </button>
      </div>
    </div>
  );
};
