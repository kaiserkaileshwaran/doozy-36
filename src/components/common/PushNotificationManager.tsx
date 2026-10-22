'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { database, ref, set, update, remove } from '../../lib/firebase';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const SUBSCRIPTIONS_PATH = 'doozy_push/subscriptions';
const ID_STORAGE_KEY = 'doozy_push_id';
const DISMISS_STORAGE_KEY = 'doozy_push_dismissed_at';
const DISMISS_FOR_MS = 3 * 24 * 60 * 60 * 1000;

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) output[i] = rawData.charCodeAt(i);
  return output;
}

// A stable, database-safe id for this browser, derived from its push endpoint.
async function idFromEndpoint(endpoint: string) {
  const bytes = new TextEncoder().encode(endpoint);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}

const pushSupported = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

export const PushNotificationManager = () => {
  const [showBanner, setShowBanner] = useState(false);
  const { showToast, cart } = useStore();
  const subscriptionId = useRef<string | null>(null);

  // Registers (or refreshes) this browser's subscription in the database.
  const syncSubscription = useCallback(async () => {
    if (!VAPID_PUBLIC_KEY) return false;
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;

    const subscription =
      (await registration.pushManager.getSubscription()) ||
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      }));

    const json = subscription.toJSON();
    if (!json.endpoint || !json.keys) return false;

    const id = await idFromEndpoint(json.endpoint);
    subscriptionId.current = id;
    localStorage.setItem(ID_STORAGE_KEY, id);

    await update(ref(database, `${SUBSCRIPTIONS_PATH}/${id}`), {
      endpoint: json.endpoint,
      keys: json.keys,
      updatedAt: Date.now(),
    });
    return true;
  }, []);

  // Decide whether to ask, or quietly re-sync if the user already said yes.
  useEffect(() => {
    if (!pushSupported() || !VAPID_PUBLIC_KEY) return;

    if (Notification.permission === 'granted') {
      // Only re-sync if the user hasn't switched notifications off in their account
      subscriptionId.current = localStorage.getItem(ID_STORAGE_KEY);
      if (subscriptionId.current) syncSubscription().catch(() => {});
      return;
    }

    if (Notification.permission === 'default') {
      const dismissedAt = Number(localStorage.getItem(DISMISS_STORAGE_KEY) || 0);
      if (Date.now() - dismissedAt < DISMISS_FOR_MS) return;
      const timer = setTimeout(() => setShowBanner(true), 6000);
      return () => clearTimeout(timer);
    }
  }, [syncSubscription]);

  // Keep a small snapshot of the bag so we can nudge when it is left behind.
  useEffect(() => {
    if (!pushSupported() || Notification.permission !== 'granted') return;
    const id = subscriptionId.current || localStorage.getItem(ID_STORAGE_KEY);
    if (!id) return;

    const cartRef = ref(database, `${SUBSCRIPTIONS_PATH}/${id}/cart`);
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

    if (count === 0) {
      remove(cartRef).catch(() => {});
      return;
    }

    const names = cart
      .map((item) => item.product?.title || item.title)
      .filter((n): n is string => !!n)
      .slice(0, 3);

    set(cartRef, { count, names, updatedAt: Date.now() }).catch(() => {});
  }, [cart]);

  const handleEnable = async () => {
    setShowBanner(false);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return;
      const ok = await syncSubscription();
      if (ok) {
        showToast('Notifications On', 'We will let you know about new launches and offers.', 'success');
      }
    } catch (error) {
      console.warn('Could not enable notifications:', error);
    }
  };

  const handleLater = () => {
    setShowBanner(false);
    localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-md bg-white rounded-[20px] shadow-2xl border border-stone-100 p-4 flex items-start gap-4"
        >
          <div className="w-10 h-10 bg-[#800020]/10 rounded-full flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-[#800020]" />
          </div>
          <div className="flex-1">
            <h4 className="font-serif-luxury text-lg font-bold text-stone-900">Stay in the loop</h4>
            <p className="text-sm text-stone-500 mt-1 mb-3">
              Be the first to hear about new launches, offers, and items left in your bag.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleEnable}
                className="px-4 py-2 bg-[#800020] text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-stone-900 transition-colors"
              >
                Allow
              </button>
              <button
                onClick={handleLater}
                className="px-4 py-2 bg-stone-100 text-stone-600 text-xs font-bold uppercase tracking-wider rounded-full hover:bg-stone-200 transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
          <button onClick={handleLater} aria-label="Close" className="text-stone-400 hover:text-stone-600">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
