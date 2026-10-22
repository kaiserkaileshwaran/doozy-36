import { NextResponse } from 'next/server';
import { ref, update } from 'firebase/database';
import { database } from '../../../../lib/firebase';
import {
  SUBSCRIPTIONS_PATH,
  loadSubscriptions,
  pushIsConfigured,
  sendTo,
} from '../../../../lib/pushServer';

export const dynamic = 'force-dynamic';

// How long a cart has to sit untouched before we nudge the customer.
const IDLE_MS = 3 * 60 * 60 * 1000;

// Called on a schedule (see vercel.json). Vercel sends the CRON_SECRET as a
// bearer token when the variable is set on the project.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!pushIsConfigured()) {
    return NextResponse.json({ success: false, error: 'Push keys are not configured on the server.' }, { status: 500 });
  }

  try {
    const subscriptions = await loadSubscriptions();
    const now = Date.now();
    let sent = 0;

    for (const [id, sub] of Object.entries(subscriptions)) {
      const cart = sub.cart;
      if (!cart || cart.count < 1) continue;
      if (now - cart.updatedAt < IDLE_MS) continue;
      if (cart.remindedAt && cart.remindedAt >= cart.updatedAt) continue;

      const first = cart.names?.[0];
      const body = cart.count > 1 && first
        ? `${first} and ${cart.count - 1} more item${cart.count > 2 ? 's' : ''} are still in your bag.`
        : first
          ? `${first} is still waiting in your bag.`
          : 'You left something beautiful in your bag.';

      const ok = await sendTo(id, sub, {
        title: 'Your bag is waiting',
        body,
        icon: '/logo.jpg',
        data: { url: '/cart' },
      });

      if (ok) {
        sent += 1;
        await update(ref(database, `${SUBSCRIPTIONS_PATH}/${id}/cart`), { remindedAt: now });
      }
    }

    return NextResponse.json({ success: true, sent });
  } catch (error: any) {
    console.error('Cart reminder run failed:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Unknown error' }, { status: 500 });
  }
}
