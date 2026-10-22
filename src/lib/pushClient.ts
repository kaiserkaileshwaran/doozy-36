export interface BroadcastPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

/**
 * Asks the server to push a notification to every subscribed browser.
 * Failures are swallowed on purpose: a notification problem should never
 * block an admin from saving a product or an offer.
 */
export async function broadcastPush(payload: BroadcastPayload): Promise<boolean> {
  try {
    const res = await fetch('/api/push/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}
