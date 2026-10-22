'use client';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { geocodeAddress, calculateDistance, calculateDrivingDistance } from '../../lib/distanceUtils';
import { Map } from 'lucide-react';
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  CheckCircle2, 
  Lock, 
  Gift, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Package, 
  AlertCircle,
  Copy,
  QrCode,
  Smartphone,
  Banknote,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Order } from '../../types';

export const CheckoutFlow: React.FC = () => {
  const router = useRouter();  const {
    cart,
    cartSubtotal,
    cartDiscount,
    cartShipping,
    cartTax,
    cartTotal,
    checkoutSessionCart,
    setCheckoutSessionCart,
    formatPrice,
    storeSettings,
    clearCart, removeFromCart,
    currentUser,
    addresses,
    applyPromoCode,
    appliedPromoCode,
    discountRate,
    createOrder,
    showToast,
    products,
    updateProduct,
    announcements,
    branches,
    shippingRates
  } = useStore();

  // Dynamically compute checkout totals if using checkoutSessionCart, else fallback to global cart
  const displayCart = checkoutSessionCart || cart;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");

  // Step 1: Address Form State
  const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
  const [addressData, setAddressData] = useState({
    fullName: defaultAddr?.fullName || currentUser?.name || '',
    street: defaultAddr?.street || '',
    apartment: defaultAddr?.apartment || '',
    city: defaultAddr?.city || '',
    state: defaultAddr?.state || '',
    postalCode: defaultAddr?.postalCode || '560038',
    country: defaultAddr?.country || 'India',
    phone: defaultAddr?.phone || '+91 94884 45184'
  });

  // Step 2: Shipping Method
  const [calculatedShipping, setCalculatedShipping] = useState<number>(0);
  
  useEffect(() => {
    if (addressData.state && addressData.city) {
      const stateKey = Object.keys(shippingRates).find(s => s.toLowerCase() === addressData.state.toLowerCase());
      if (stateKey && shippingRates[stateKey]) {
        let matchKey = Object.keys(shippingRates[stateKey]).find(
          k => k.toLowerCase() === addressData.city.toLowerCase()
        );
        if (!matchKey) {
          matchKey = Object.keys(shippingRates[stateKey]).find(
            k => k.toLowerCase().includes(addressData.city.toLowerCase()) || addressData.city.toLowerCase().includes(k.toLowerCase())
          );
        }
        setCalculatedShipping(matchKey ? shippingRates[stateKey][matchKey] : 150);
      } else {
        setCalculatedShipping(150);
      }
    } else {
      setCalculatedShipping(150); // fallback
    }
  }, [addressData.state, addressData.city, shippingRates]);
  const [nearestBranch, setNearestBranch] = useState<any>(null);
  const [shippingDistance, setShippingDistance] = useState<number>(0);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const displaySubtotal = checkoutSessionCart ? checkoutSessionCart.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0) : cartSubtotal;
  const displayTax = checkoutSessionCart ? Math.round(displaySubtotal * 0.05) : cartTax;
  const displayDiscount = checkoutSessionCart ? Math.round(displaySubtotal * (cartSubtotal > 0 ? (cartDiscount / cartSubtotal) : 0)) : cartDiscount;
  const displayShipping = calculatedShipping;
  const displayTotal = Math.max(0, displaySubtotal - displayDiscount + displayShipping + displayTax);




  
  const handleContinueToShipping = async () => {
    if (!addressData.street || !addressData.city || !addressData.state) {
      showToast('Missing Address', 'Please provide a valid street, city, and state.', 'warning');
      return;
    }
    
    setIsCalculatingShipping(true);
    
    // Look up exact exact rate
    const stateRates = shippingRates[addressData.state] || {};
    
    // Case-insensitive match just in case
    const matchKey = Object.keys(stateRates).find(
      k => k.toLowerCase() === addressData.city.toLowerCase()
    );
    
    const rate = matchKey ? stateRates[matchKey] : 150; // Fallback to 150 if not explicitly defined
    
    setTimeout(() => {
      setCalculatedShipping(rate);
      setIsCalculatingShipping(false);
      setStep(2);
    }, 600);
  };

  // Step 3: Packaging & Gift
  const [giftPackaging, setGiftPackaging] = useState(true);
  const [giftNote, setGiftNote] = useState('');

  // Step 4: Payment Simulation State (UPI, Card, Netbanking, COD)
  const [paymentOption, setPaymentOption] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('upi');
  const [upiVpa, setUpiVpa] = useState('aaradhya@okaxis');
  const [isProcessing, setIsProcessing] = useState(false);

  // If cart is empty and no completed order, redirect
  if (displayCart.length === 0 && !completedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <Package className="w-12 h-12 text-[#800020] mx-auto mb-4" />
        <h2 className="font-serif-luxury text-3xl font-normal text-stone-900">
          No Ensembles in Shopping Bag
        </h2>
        <p className="text-stone-500 text-sm mt-2">
          Please select pieces from our ethnic collections before entering the checkout salon.
        </p>
        <button
          onClick={() => router.push('/products')}
          className="mt-6 bg-[#800020] text-white px-8 py-3 rounded-sm text-xs font-bold uppercase tracking-widest cursor-pointer"
        >
          Explore Collection
        </button>
      </div>
    );
  }

  const handleNext = () => setStep(prev => Math.min(prev + 1, 4) as any);
  const handleBack = () => setStep(prev => Math.max(prev - 1, 1) as any);

  // Step 4 Complete Handler (Trigger Confetti + Order Placement)
  const handlePlaceOrder = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const newOrder = createOrder({
        shipping: calculatedShipping,
        shippingAddress: {
          id: `addr-${Date.now()}`,
          ...addressData,
          isDefault: true
        },
        paymentMethod:
          paymentOption === 'upi'
            ? `UPI Instant (${upiVpa})`
            : paymentOption === 'card'
            ? 'HDFC Regalia Gold Credit Card (•••• 9801)'
            : paymentOption === 'netbanking'
            ? 'ICICI Corporate NetBanking'
            : 'Cash on Delivery (Verified)'
      });

      setCompletedOrder(newOrder);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#800020', '#D4AF37', '#FAF9F6', '#5A091A']
        });
      } catch (err) {
        // Safe fallback
      }

      showToast(
        'Order Dispatched to Atelier',
        `Your order #${newOrder.orderNumber} is confirmed. Express dispatch underway.`,
        'success'
      );
      
      // Clear relevant cart upon successful order
      if (checkoutSessionCart) {
        checkoutSessionCart.forEach(item => { if (item.id) removeFromCart(item.id); });
        setCheckoutSessionCart(null);
      } else {
        clearCart();
      }
    }, 1200);
  };

  // Render Completed Order Confirmation Screen
  if (completedOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8">
        <div className="bg-white rounded-sm p-8 sm:p-12 border border-stone-200 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 bg-[#800020]/10 text-[#800020] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#800020] block mb-1">
              Payment Successful
            </span>
            <h1 className="font-serif-luxury text-3xl sm:text-4xl text-stone-900 font-normal">
              Your Order Has Been Placed
            </h1>
            <p className="text-stone-600 text-xs sm:text-sm mt-2 max-w-lg mx-auto">
              Thank you for your purchase. We are carefully preparing your items for dispatch. You will receive an email confirmation shortly.
            </p>
          </div>

          {/* Order Details Pill Card */}
          <div className="bg-[#FAF9F6] p-6 rounded-sm border border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left text-xs">
            <div>
              <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-bold">Order Number</span>
              <span className="font-serif-luxury font-bold text-base text-stone-900">
                #{completedOrder.orderNumber}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-bold">Courier Tracking</span>
              <span className="font-bold text-stone-900 text-xs flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#800020]" />
                {completedOrder.trackingLink ? 'Link Sent to Profile' : 'Awaiting Dispatch'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-bold">Total Settled</span>
              <span className="font-serif-luxury font-bold text-base text-[#800020]">
                {formatPrice(completedOrder.total || (completedOrder as any).totalAmount || 0)}
              </span>
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="border-t border-stone-100 pt-6 text-left space-y-4">
            <h3 className="font-serif-luxury text-lg font-bold text-stone-900">
              Reserved Ensembles
            </h3>
            <div className="divide-y divide-stone-100">
              {completedOrder.items?.map((item, index) => {
                const itemImg = item.image || (item as any).product?.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=85';
                const itemTitle = item.title || (item as any).product?.title || 'DOOZY Garment';
                const itemSize = item.size || (item as any).selectedSize || 'M (38)';
                const itemQty = item.quantity || 1;
                const itemPrice = item.price || (item as any).product?.price || 0;
                const targetId = item.productId || (item as any).product?.id || (item as any).id;

                return (
                  <div key={targetId ? `${targetId}-${index}` : index} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={itemImg}
                        alt={itemTitle}
                        className="w-12 h-16 object-cover rounded-lg border border-stone-200"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-stone-900">{itemTitle}</h4>
                        <p className="text-[11px] text-stone-500">
                          Size: {itemSize} • Qty: {itemQty}
                        </p>
                      </div>
                    </div>
                    <span className="font-serif-luxury font-bold text-sm text-[#800020]">
                      {formatPrice(itemPrice * itemQty)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/account')}
              className="bg-[#800020] hover:bg-[#5c0017] text-white px-8 py-3.5 rounded-sm text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
            >
              View Order in Account Dashboard
            </button>
            <button
              onClick={() => router.push('/')}
              className="border border-stone-300 hover:bg-stone-100 text-stone-800 px-8 py-3.5 rounded-sm text-xs font-bold uppercase tracking-widest transition-all cursor-pointer"
            >
              Return To Boutique
            </button>
          </div>
        </div>

        {/* Post-Purchase Suggestions */}
        <div className="mt-16 bg-white rounded-sm p-8 sm:p-12 border border-stone-200 shadow-sm">
          <div className="text-center mb-10">
            <h2 className="font-serif-luxury text-2xl sm:text-3xl text-stone-900 mb-2">Continue Exploring</h2>
            <p className="text-stone-500 text-xs sm:text-sm">We curated these exquisite pieces based on your recent purchase.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {products
              .filter((p: any) => !(completedOrder.items || []).some(i => i.productId === p.id || (i as any).product?.id === p.id))
              .sort(() => 0.5 - Math.random())
              .slice(0, 4)
              .map((product: any) => (
                <div 
                  key={product.id} 
                  className="group cursor-pointer"
                  onClick={() => router.push('/products/' + product.id)}
                >
                  <div className="aspect-[3/4] bg-stone-100 overflow-hidden mb-3 rounded-lg border border-stone-200 relative">
                    <img src={product.images?.[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <h3 className="text-[10px] sm:text-xs font-bold text-stone-900 uppercase tracking-widest truncate">{product.title}</h3>
                  <p className="font-serif-luxury font-bold text-xs sm:text-sm text-[#800020]">{formatPrice(product.price)}</p>
                </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[5120px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Checkout Progress Stepper */}
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider relative">
          <div className="absolute top-4 inset-x-8 h-0.5 bg-stone-200 -z-0" />
          
          <button
            onClick={() => setStep(1)}
            className={`flex flex-col items-center gap-2 relative z-10 ${step >= 1 ? 'text-[#800020]' : 'text-stone-400'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? 'bg-[#800020] text-white' : 'bg-stone-200 text-stone-600'
            }`}>
              1
            </div>
            <span>Delivery Address</span>
          </button>

          <button
            onClick={() => setStep(2)}
            className={`flex flex-col items-center gap-2 relative z-10 ${step >= 2 ? 'text-[#800020]' : 'text-stone-400'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? 'bg-[#800020] text-white' : 'bg-stone-200 text-stone-600'
            }`}>
              2
            </div>
            <span>Delivery Pricing</span>
          </button>

          <button
            onClick={() => setStep(3)}
            className={`flex flex-col items-center gap-2 relative z-10 ${step >= 3 ? 'text-[#800020]' : 'text-stone-400'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 3 ? 'bg-[#800020] text-white' : 'bg-stone-200 text-stone-600'
            }`}>
              3
            </div>
            <span>Secure Payment</span>
          </button>
        </div>
      </div>

      {/* Main Checkout Layout: Steps Content + Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Step Form Container */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-sm border border-stone-200/80 shadow-xs space-y-8">
          {/* STEP 1: Delivery Address Selection */}
          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="font-serif-luxury text-2xl font-bold text-stone-900">
                  Select Delivery Address
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Choose where you'd like your order delivered.
                </p>
              </div>

              <div className="space-y-4">
                {addresses.length === 0 ? (
                  <p className="text-sm text-stone-500">No saved addresses found. Please add one in your profile.</p>
                ) : (
                  addresses.map(addr => (
                    <div 
                      key={addr.id}
                      onClick={() => setAddressData({ ...addr, apartment: addr.apartment || "", state: addr.state || "" })}
                      className={`p-5 rounded-sm border-2 cursor-pointer transition-all ${
                        addressData.street === addr.street && addressData.city === addr.city
                          ? 'border-[#800020] bg-[#800020]/5'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-sm text-stone-900">{addr.fullName}</h4>
                          <p className="text-xs text-stone-600 mt-1">
                            {addr.street}{addr.apartment ? `, ${addr.apartment}` : ''}
                            <br />
                            {addr.city}, {addr.state} - {addr.postalCode}
                          </p>
                          <p className="text-xs text-stone-500 mt-1">Phone: {addr.phone}</p>
                        </div>
                        {addressData.street === addr.street && addressData.city === addr.city && (
                          <div className="w-5 h-5 bg-[#800020] rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!addressData.street}
                  className="bg-[#800020] text-white px-8 py-3 rounded-sm text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  <span>Delivery Pricing</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Delivery Pricing */}
          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="font-serif-luxury text-2xl font-bold text-stone-900">
                  Delivery Pricing
                </h3>
                
              </div>

              <div className="bg-stone-50 border border-stone-200 rounded-[12px] p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-full shadow-sm">
                    <Map className="w-6 h-6 text-[#800020]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900">Shipping To</h4>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      <strong>{addressData.fullName}</strong><br />
                      {addressData.street}{addressData.apartment ? `, ${addressData.apartment}` : ''}<br />
                      {addressData.city}, {addressData.state} - {addressData.postalCode}<br />
                      {addressData.country}<br />
                      Phone: {addressData.phone}
                    </p>
                  </div>
                </div>
                
                <div className="h-px bg-stone-200 w-full my-2"></div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-600 font-medium">Delivery Cost:</span>
                  <span className="text-lg font-bold text-[#800020]">{calculatedShipping === 0 ? 'COMPLIMENTARY' : formatPrice(calculatedShipping)}</span>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="text-stone-600 hover:text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Address</span>
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="bg-[#800020] text-white px-8 py-3 rounded-sm text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors cursor-pointer flex items-center gap-2"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment */}
          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div>
                <h3 className="font-serif-luxury text-2xl font-bold text-stone-900">
                  Secure Payment
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  All transactions are 256-bit encrypted.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentOption('upi')}
                  className={`p-4 rounded-sm border-2 flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                    paymentOption === 'upi'
                      ? 'border-[#800020] bg-[#800020]/5 text-[#800020]'
                      : 'border-stone-200 text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                  <span className="text-xs font-bold">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentOption('card')}
                  className={`p-4 rounded-sm border-2 flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                    paymentOption === 'card'
                      ? 'border-[#800020] bg-[#800020]/5 text-[#800020]'
                      : 'border-stone-200 text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs font-bold">Card (Visa/RuPay)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentOption('netbanking')}
                  className={`p-4 rounded-sm border-2 flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                    paymentOption === 'netbanking'
                      ? 'border-[#800020] bg-[#800020]/5 text-[#800020]'
                      : 'border-stone-200 text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <Award className="w-5 h-5" />
                  <span className="text-xs font-bold">NetBanking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentOption('cod')}
                  className={`p-4 rounded-sm border-2 flex flex-col items-center gap-2 text-center transition-all cursor-pointer ${
                    paymentOption === 'cod'
                      ? 'border-[#800020] bg-[#800020]/5 text-[#800020]'
                      : 'border-stone-200 text-stone-700 hover:border-stone-300'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  <span className="text-xs font-bold">Cash On Delivery</span>
                </button>
              </div>

              {/* Dynamic Payment Details Panel */}
              <div className="bg-[#FAF9F6] p-5 rounded-sm border border-stone-200">
                {paymentOption === 'upi' && (
                  <div className="space-y-3 text-xs">
                    <label className="font-bold uppercase tracking-wider text-stone-700 block">
                      Enter UPI ID / VPA
                    </label>
                    <input
                      type="text"
                      value={upiVpa}
                      onChange={e => setUpiVpa(e.target.value)}
                      placeholder="username@okaxis or mobile@upi"
                      className="w-full p-3.5 bg-white border border-stone-200 rounded-sm text-xs focus:outline-none focus:border-[#800020]"
                    />
                    <p className="text-[11px] text-stone-500">
                      Supports Google Pay, PhonePe, Paytm, BHIM & WhatsApp Pay. A payment request will be sent to your UPI app.
                    </p>
                  </div>
                )}

                {paymentOption === 'card' && (
                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold uppercase tracking-wider text-stone-700 block">Card Number</label>
                      <input
                        type="text"
                        defaultValue="4111 2222 3333 4444"
                        className="w-full p-3.5 bg-white border border-stone-200 rounded-sm text-xs font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold uppercase tracking-wider text-stone-700 block">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          defaultValue="12/28"
                          className="w-full p-3.5 bg-white border border-stone-200 rounded-sm text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold uppercase tracking-wider text-stone-700 block">CVV</label>
                        <input
                          type="password"
                          defaultValue="789"
                          maxLength={4}
                          className="w-full p-3.5 bg-white border border-stone-200 rounded-sm text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentOption === 'netbanking' && (
                  <div className="space-y-2 text-xs">
                    <label className="font-bold uppercase tracking-wider text-stone-700 block">Select Bank</label>
                    <select className="w-full p-3.5 bg-white border border-stone-200 rounded-sm text-xs font-medium">
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>State Bank of India</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                {paymentOption === 'cod' && (
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-stone-900 block">Cash on Delivery Available</span>
                    <p className="text-stone-500">Please keep exact change ready during BlueDart courier handover.</p>
                  </div>
                )}
              </div>

              {/* Complete Payment Button */}
              <div className="pt-4 flex justify-between items-center">
                <button
                  onClick={() => setStep(3)}
                  className="text-stone-600 hover:text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  id="complete-order-btn"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="bg-[#800020] hover:bg-[#5c0017] text-white px-9 py-4 rounded-sm text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isProcessing ? 'Authorizing Dispatch...' : `Authorize & Pay ${formatPrice(cartTotal)}`}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Sticky Order Summary Sidebar */}
        <aside className="lg:col-span-4 bg-[#FDFBF7] p-6 sm:p-8 rounded-sm border border-stone-200/80 shadow-xs space-y-6 sticky top-24">
          <h3 className="font-serif-luxury text-xl font-bold text-stone-900 border-b border-stone-200 pb-3">
            Summary ({displayCart.reduce((a, b) => a + b.quantity, 0)} Items)
          </h3>

          <div className="divide-y divide-stone-200 max-h-72 overflow-y-auto pr-1">
            {displayCart.map((item, index) => {
              const itemImg = item.product?.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=85';
              const itemTitle = item.product?.title || 'DOOZY Product';
              const itemPrice = item.product?.price || 0;

              return (
                <div key={item.id || index} className="py-3 flex gap-3">
                  <img
                    src={itemImg}
                    alt={itemTitle}
                    className="w-14 h-18 object-cover rounded-sm border border-stone-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-stone-900 truncate">{itemTitle}</h4>
                    <p className="text-[11px] text-stone-500">
                      Size: {item.selectedSize} • Qty: {item.quantity}
                    </p>
                    <span className="font-serif-luxury font-bold text-xs text-[#800020] mt-1 block">
                      {formatPrice(itemPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Promo Code Section */}
          <div className="border-t border-stone-200 pt-6 pb-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-stone-900 mb-3">Atelier Privileges</h4>
            
            {announcements?.filter(a => a.isActive !== false && a.code && a.discountPercentage && !a.isHidden).length > 0 && !appliedPromoCode && (
              <div className="space-y-2 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Available Offers</span>
                <div className="flex flex-col gap-2">
                  {announcements.filter(a => a.isActive !== false && a.code && a.discountPercentage && !a.isHidden).map((promo, idx) => (
                    <button key={promo.id + idx.toString()}
                      type="button"
                      onClick={() => applyPromoCode(promo.code!)}
                      className="text-left w-full bg-[#fdfbf7] border border-stone-200 px-3 py-2 rounded-sm hover:border-[#800020] transition-colors flex justify-between items-center group"
                    >
                      <span className="text-[11px] font-bold text-stone-900 group-hover:text-[#800020] transition-colors">{promo.code}</span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm">{promo.discountPercentage}% OFF</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!appliedPromoCode ? (
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter VIP Code" 
                  value={promoInput}
                  onChange={(e) => { setPromoInput(e.target.value); setPromoError(''); }}
                  className="flex-1 bg-transparent border border-stone-300 rounded-sm px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#800020] uppercase"
                />
                <button 
                  onClick={() => {
                    if (promoInput.trim()) {
                      const success = applyPromoCode(promoInput.trim());
                      if (!success) setPromoError('Invalid or expired code.');
                      else setPromoInput('');
                    }
                  }}
                  className="bg-stone-900 text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-[#800020] transition-colors"
                >
                  Apply
                </button>
              </div>
            ) : null}
            {promoError && <p className="text-[10px] text-rose-600 mt-1.5">{promoError}</p>}
            {appliedPromoCode && !promoError && (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-3 rounded-sm mt-2">
                <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Code {appliedPromoCode} applied</p>
                <button onClick={() => applyPromoCode('')} className="text-[10px] font-bold text-stone-500 hover:text-stone-900 uppercase tracking-widest transition-colors">Remove</button>
              </div>
            )}
          </div>

          {/* Totals Calculation */}
          <div className="space-y-2 text-xs text-stone-600 border-t border-stone-200 pt-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-stone-900">{formatPrice(displaySubtotal)}</span>
            </div>

            {displayDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Atelier VIP Code Discount</span>
                <span>-{formatPrice(displayDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Regional Delivery</span>
              <span>
                {(!addressData.state || !addressData.city) ? <span className="text-stone-400 italic text-xs">Calculated at next step</span> : (displayShipping === 0 ? <span className="text-[#800020] font-bold">COMPLIMENTARY</span> : formatPrice(displayShipping))}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>Tax ({storeSettings?.taxRate || 0}%)</span>
              <span className="font-semibold text-stone-900">{formatPrice(displayTax)}</span>
            </div>

            <div className="flex justify-between items-center border-t border-stone-200 pt-4 mt-2">
              <span className="font-bold text-stone-900 text-sm">Total to Pay</span>
              <span className="font-serif-luxury text-xl text-[#800020]">{formatPrice(displayTotal)}</span>
            </div>
          </div>

          
        </aside>
      </div>
    </div>
  );
};
