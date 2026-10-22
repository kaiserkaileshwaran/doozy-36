import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Ruler, Sparkles, Check, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SizeGuideModal: React.FC = () => {
  const { sizeChartOpen, setSizeChartOpen, selectedProduct } = useStore();
  const [unit, setUnit] = useState<'in' | 'cm'>('in');

  if (!sizeChartOpen) return null;

  const standardSizes = [
    { size: 'XS (34)', bust: 34, waist: 28, hip: 36, kurtaLen: 46, chuditharLen: 44, shoulder: 14 },
    { size: 'S (36)', bust: 36, waist: 30, hip: 38, kurtaLen: 46, chuditharLen: 44, shoulder: 14.5 },
    { size: 'M (38)', bust: 38, waist: 32, hip: 40, kurtaLen: 47, chuditharLen: 45, shoulder: 15 },
    { size: 'L (40)', bust: 40, waist: 34, hip: 42, kurtaLen: 47, chuditharLen: 45, shoulder: 15.5 },
    { size: 'XL (42)', bust: 42, waist: 36, hip: 44, kurtaLen: 48, chuditharLen: 46, shoulder: 16 },
    { size: 'XXL (44)', bust: 44, waist: 38, hip: 46, kurtaLen: 48, chuditharLen: 46, shoulder: 16.5 },
    { size: '3XL (46)', bust: 46, waist: 40, hip: 48, kurtaLen: 48, chuditharLen: 46, shoulder: 17 }
  ];

  const convert = (valInches: number) => {
    if (unit === 'cm') {
      return Math.round(valInches * 2.54);
    }
    return valInches;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSizeChartOpen(false)}
          className="fixed inset-0 bg-black/70 transition-opacity"
        />

        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-2xl bg-[#FDFBF7] rounded-sm shadow-md overflow-hidden border border-stone-200 p-6 sm:p-8"
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-5 border-b border-stone-200">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#800020]/10 text-[#800020] text-[10px] font-bold uppercase tracking-wider">
                  <Ruler className="w-3.5 h-3.5" />
                  <span>Indian Ethnic & Ready-To-Wear Fit Guide</span>
                </div>
                <h3 className="font-serif-luxury text-2xl sm:text-3xl text-stone-900 font-bold">
                  Bespoke Sizing Master
                </h3>
                <p className="text-xs text-stone-500">
                  {selectedProduct ? `Specific fit metrics for: ${selectedProduct.title}` : 'Universal DOOZY Tailoring Standards'}
                </p>
              </div>

              <button
                onClick={() => setSizeChartOpen(false)}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
                aria-label="Close size guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Unit Toggle */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-2 text-xs text-stone-600">
                <Info className="w-4 h-4 text-[#800020]" />
                <span>All measurements represent garment circumference with standard ease.</span>
              </div>
              <div className="inline-flex bg-stone-200 p-1 rounded-sm text-xs font-bold">
                <button
                  onClick={() => setUnit('in')}
                  className={`px-3 py-1 rounded-lg transition-all ${unit === 'in' ? 'bg-[#800020] text-white shadow-xs' : 'text-stone-700'}`}
                >
                  Inches
                </button>
                <button
                  onClick={() => setUnit('cm')}
                  className={`px-3 py-1 rounded-lg transition-all ${unit === 'cm' ? 'bg-[#800020] text-white shadow-xs' : 'text-stone-700'}`}
                >
                  Centimeters
                </button>
              </div>
            </div>

            {/* Size Table */}
            <div className="overflow-x-auto rounded-sm border border-stone-200 bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F6] text-stone-700 font-bold uppercase tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Size (Chest)</th>
                    <th className="py-3 px-3">Bust ({unit})</th>
                    <th className="py-3 px-3">Waist ({unit})</th>
                    <th className="py-3 px-3">Hip ({unit})</th>
                    <th className="py-3 px-3">Shoulder ({unit})</th>
                    <th className="py-3 px-3">Kurta Length ({unit})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {standardSizes.map((row) => (
                    <tr key={row.size} className="hover:bg-stone-50 transition-colors">
                      <td className="py-2.5 px-4 font-bold text-[#800020]">{row.size}</td>
                      <td className="py-2.5 px-3 text-stone-800 font-semibold">{convert(row.bust)}</td>
                      <td className="py-2.5 px-3 text-stone-600">{convert(row.waist)}</td>
                      <td className="py-2.5 px-3 text-stone-600">{convert(row.hip)}</td>
                      <td className="py-2.5 px-3 text-stone-600">{convert(row.shoulder)}</td>
                      <td className="py-2.5 px-3 text-stone-600">{convert(row.kurtaLen)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Fit Tips */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#800020]/5 p-4 rounded-sm border border-[#800020]/15">
              <div>
                <p className="font-bold text-[#800020] mb-0.5">Kurtas & Chudithars</p>
                <p className="text-stone-600 leading-relaxed">
                  Our kurtas have a 3–4 inch relaxed ease over body measurements. We recommend ordering according to your exact bust size in inches (e.g. 38" bust = M 38).
                </p>
              </div>
              <div>
                <p className="font-bold text-[#800020] mb-0.5">Co-ords & Dresses</p>
                <p className="text-stone-600 leading-relaxed">
                  Co-ord trousers feature elasticated back waistbands for an adaptive, flattering fit.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSizeChartOpen(false)}
                className="bg-stone-900 hover:bg-black text-white px-6 py-2.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all"
              >
                Got It, Return to Selection
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
