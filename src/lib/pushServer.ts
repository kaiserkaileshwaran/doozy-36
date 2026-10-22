import webpush from 'web-push';
import { get, ref, remove } from 'firebase/database';
import { database } from './firebase';

export const SUBSCRIPTIONS_PATH = 'doozy_push/subscriptions';

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const contact = process.env.VAPID_CONTACT || 'mailto:admin@doozy.fashion';

let configured = false;

export function pushIsConfigured(): boolean {
  if (configured) return true;
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(contact, publicKey, privateKey);
  configured = true;
  return true;
}

export type StoredSubscription = {
  endpoint?: string;
  keys?: { p256dh: string; auth: string };
  cart?: { count: number; names: string[]; updatedAt: number; remindedAt?: number };
};

export async function loadSubscriptions(): Promise<Record<string, StoredSubscription>> {
  const snap = await get(ref(database, SUBSCRIPTIONS_PATH));
  return snap.exists() ? snap.val() : {};
}

/** Sends one notification and clears the subscription if the browser says it is gone. */
export async function sendTo(
  id: string,
  sub: StoredSubscription,
  payload: Record<string, unknown>
): Promise<boolean> {
  if (!sub.endpoint || !sub.keys) return false;
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: sub.keys },
      JSON.stringify(payload)
    );
    return true;
  } catch (err: any) {
    if (err?.statusCode === 404 || err?.statusCode === 410) {
      await remove(ref(database, `${SUBSCRIPTIONS_PATH}/${id}`)).catch(() => {});
    } else {
      console.error('Push delivery failed for', id, err?.statusCode || err);
    }
    return false;
  }
}
