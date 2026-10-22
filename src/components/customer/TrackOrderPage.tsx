'use client';
import { motion } from 'motion/react';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {  Package, ArrowLeft, CheckCircle2, Circle, Truck, MapPin, Clock , ExternalLink } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const TrackOrderPage: React.FC = () => {
  const router = useRouter();
  const { orders, currentUser, formatPrice } = useStore();

  const myOrders = orders.filter(o => o.customerEmail === currentUser?.email).sort((a,b) => new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime());

  const getStatusIndex = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s === 'processing') return 0;
    if (s === 'shipped') return 1;
    if (s === 'delivered') return 2;
    if (s === 'cancelled') return -1;
    return 0;
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
        <Package className="w-16 h-16 text-stone-300 mb-6" />
        <h2 className="font-serif-luxury text-3xl text-stone-900 mb-4">Please log in to track your orders</h2>
        <button onClick={() => router.push('/auth')} className="bg-[#800020] text-white px-8 py-3 font-bold uppercase tracking-widest text-xs rounded-sm">Log In / Register</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-24">
      <div className="bg-white border-b border-stone-200 px-4 sm:px-8 py-6 sticky top-16 lg:top-[104px] z-[50]">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors" aria-label="Go back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-[#800020]" />
            <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-stone-900">Track Orders</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-12">
        {myOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8 text-stone-400" />
            </div>
            <h3 className="font-serif-luxury text-2xl font-bold text-stone-900 mb-2">No Active Orders</h3>
            <p className="text-stone-500 mb-6">You haven't placed any orders yet.</p>
            <button onClick={() => router.push('/products')} className="bg-[#800020] text-white px-8 py-3 rounded-sm text-xs font-bold uppercase tracking-widest">Explore Collections</button>
          </div>
        ) : (
          myOrders.map(order => {
            const statusIdx = getStatusIndex(order.status);
            const isCancelled = statusIdx === -1;

            return (
              <div key={order.id} className="bg-white rounded-md shadow-sm border border-stone-200 overflow-hidden">
                <div className="bg-stone-50 border-b border-stone-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block mb-1">Order #{order.orderNumber}</span>
                    <h3 className="font-serif-luxury text-xl font-bold text-stone-900">Placed on {new Date(order.date || order.createdAt || '').toLocaleDateString()}</h3>
                  </div>
                  <div className="text-left md:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 block mb-1">Order Total</span>
                    <span className="font-bold text-stone-900 text-lg">{formatPrice(order.total || (order as any).totalAmount || 0)}</span>
                  </div>
                </div>

                <div className="p-6">
                  {isCancelled ? (
                    <div className="bg-rose-50 border border-rose-100 p-6 rounded-sm text-center">
                      <h4 className="font-bold text-rose-700 text-lg mb-2">Order Cancelled</h4>
                      <p className="text-rose-600 text-sm">This order has been cancelled and will not be shipped.</p>
                    </div>
                  ) : (
                    <div className="py-8">
                      <div className="relative">
                        <div className="absolute top-5 left-[5%] right-[5%] h-1 bg-stone-200 rounded-full" />
                        <motion.div 
                          className="absolute top-5 left-[5%] h-1 bg-[#800020] rounded-full"
                          initial={{ width: statusIdx === 2 ? '90%' : '0%' }}
                          whileInView={{ width: statusIdx === 0 ? '12%' : statusIdx === 1 ? '45%' : '90%' }}
                          viewport={{ once: true, margin: "-50px" }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />

                        <div className="relative flex justify-between">
                          <div className="flex flex-col items-center gap-3 w-1/3 z-10">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${statusIdx >= 0 ? 'bg-[#800020] text-white shadow-md' : 'bg-stone-200 text-stone-400'}`}>
                              {statusIdx > 0 ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                            </div>
                            <div className="text-center">
                              <span className={`block text-xs font-bold uppercase tracking-wider ${statusIdx >= 0 ? 'text-[#800020]' : 'text-stone-400'}`}>Processing</span>
                              <span className="text-[10px] text-stone-400 mt-1 block">Order Confirmed</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-center gap-3 w-1/3 z-10">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${statusIdx >= 1 ? 'bg-[#800020] text-white shadow-md' : 'bg-stone-200 text-stone-400'}`}>
                              {statusIdx > 1 ? <CheckCircle2 className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
                            </div>
                            <div className="text-center">
                              <span className={`block text-xs font-bold uppercase tracking-wider ${statusIdx >= 1 ? 'text-[#800020]' : 'text-stone-400'}`}>Shipped</span>
                              <span className="text-[10px] text-stone-400 mt-1 block">Dispatched</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-center gap-3 w-1/3 z-10">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${statusIdx >= 2 ? 'bg-[#800020] text-white shadow-md' : 'bg-stone-200 text-stone-400'}`}>
                              <MapPin className="w-5 h-5" />
                            </div>
                            <div className="text-center">
                              <span className={`block text-xs font-bold uppercase tracking-wider ${statusIdx >= 2 ? 'text-[#800020]' : 'text-stone-400'}`}>Delivered</span>
                              <span className="text-[10px] text-stone-400 mt-1 block">Arrived</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-8 pt-6 border-t border-stone-200">
                  {order.trackingLink ? (
                    <div className="flex justify-between items-center bg-white p-3 border border-stone-200 rounded mt-6 mb-2">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-stone-500">Tracking Info</p>
                        <p className="text-xs font-bold text-stone-700">Dispatched</p>
                      </div>
                      <a 
                        href={order.trackingLink} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-1.5 bg-[#800020]/10 text-[#800020] px-4 py-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-[#800020]/20 transition-colors"
                      >
                        Track Package <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ) : (
                    <div className="bg-stone-50 p-3 border border-stone-200 rounded text-center mt-6 mb-2">
                      <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Awaiting Dispatch / Tracking Link</p>
                    </div>
                  )}

                    <h4 className="font-bold text-xs uppercase tracking-widest text-stone-500 mb-4">Items in this shipment</h4>
                    <div className="space-y-4">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 bg-stone-50 p-4 rounded-sm" onClick={() => item.productId && router.push(`/products/${item.productId}`)}>
                          {item.image ? (
                            <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded shadow-sm border border-stone-200" />
                          ) : (
                            <div className="w-16 h-16 bg-stone-200 rounded" />
                          )}
                          <div className="flex-1">
                            <h5 className="font-bold text-stone-900 text-sm cursor-pointer hover:text-[#800020]">{item.title}</h5>
                            <p className="text-xs text-stone-500 mt-1">Qty: {item.quantity} | Size: {item.size || (item as any).selectedSize || 'Default'}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-serif-luxury font-bold text-stone-900">{formatPrice(item.price || 0)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
