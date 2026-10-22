'use client';
import React, { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { database, ref, update, remove } from '../../lib/firebase';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const SUBSCRIPTIONS_PATH = 'doozy_push/subscriptions';
const ID_STORAGE_KEY = 'doozy_push_id';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function idFromEndpoint(endpoint: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(endpoint));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}

type Status = 'unsupported' | 'blocked' | 'off' | 'on';

const supported = () =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window &&
  !!VAPID_PUBLIC_KEY;

async function currentStatus(): Promise<Status> {
  if (!supported()) return 'unsupported';
  if (Notification.permission === 'denied') return 'blocked';
  if (Notification.permission !== 'granted') return 'off';
  const reg = await navigator.serviceWorker.getRegistration('/');
  const sub = await reg?.pushManager.getSubscription();
  return sub ? 'on' : 'off';
}

/** Accept / decline switch for push notifications, meant for the account page. */
export const NotificationToggle: React.FC = () => {
  const { showToast } = useStore();
  const [status, setStatus] = useState<Status>('off');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    currentStatus().then(setStatus).catch(() => setStatus('off'));
  }, []);

  const enable = async () => {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      setStatus(permission === 'denied' ? 'blocked' : 'off');
      return;
    }
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;
    const sub =
      (await reg.pushManager.getSubscription()) ||
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      }));
    const json = sub.toJSON();
    if (!json.endpoint || !json.keys) throw new Error('Incomplete subscription');
    const id = await idFromEndpoint(json.endpoint);
    localStorage.setItem(ID_STORAGE_KEY, id);
    await update(ref(database, `${SUBSCRIPTIONS_PATH}/${id}`), {
      endpoint: json.endpoint,
      keys: json.keys,
      updatedAt: Date.now(),
    });
    setStatus('on');
    showToast('Notifications On', 'You will hear about new launches and offers.', 'success');
  };

  const disable = async () => {
    const reg = await navigator.serviceWorker.getRegistration('/');
    const sub = await reg?.pushManager.getSubscription();
    if (sub) {
      const id = await idFromEndpoint(sub.endpoint);
      await remove(ref(database, `${SUBSCRIPTIONS_PATH}/${id}`)).catch(() => {});
      await sub.unsubscribe();
    }
    localStorage.removeItem(ID_STORAGE_KEY);
    setStatus('off');
    showToast('Notifications Off', 'You will no longer receive alerts on this device.', 'info');
  };

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      if (status === 'on') await disable();
      else await enable();
    } catch (err) {
      console.warn('Notification setting failed:', err);
      showToast('Something went wrong', 'Could not update notification settings.', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (status === 'unsupported') return null;

  const isOn = status === 'on';
  const blocked = status === 'blocked';

  return (
    <div className="flex items-center justify-between gap-4 p-5 bg-white border border-stone-200 rounded-[15px]">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[#800020]/10 flex items-center justify-center shrink-0">
          {isOn ? <Bell className="w-5 h-5 text-[#800020]" /> : <BellOff className="w-5 h-5 text-stone-400" />}
        </div>
        <div>
          <p className="text-sm font-bold text-stone-900">Push notifications</p>
          <p className="text-xs text-stone-500 mt-0.5">
            {blocked
              ? 'Blocked in your browser. Allow notifications for this site in the address bar, then try again.'
              : isOn
                ? 'On. You get alerts for launches, offers and items left in your bag.'
                : 'Off. Turn on to hear about launches, offers and items left in your bag.'}
          </p>
        </div>
      </div>
      <button
        onClick={handleClick}
        disabled={busy || blocked}
        className={`shrink-0 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 ${
          isOn
            ? 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            : 'bg-[#800020] text-white hover:bg-stone-900'
        }`}
      >
        {isOn ? 'Decline' : 'Accept'}
      </button>
    </div>
  );
};
