import { NextResponse } from 'next/server';
import { loadSubscriptions, pushIsConfigured, sendTo } from '../../../../lib/pushServer';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { title, body, icon, url } = await req.json();

    if (!title || !body) {
      return NextResponse.json({ success: false, error: 'title and body are required.' }, { status: 400 });
    }
    if (!pushIsConfigured()) {
      return NextResponse.json({ success: false, error: 'Push keys are not configured on the server.' }, { status: 500 });
    }

    const subscriptions = await loadSubscriptions();
    const entries = Object.entries(subscriptions);
    if (entries.length === 0) {
      return NextResponse.json({ success: true, sent: 0, total: 0 });
    }

    const payload = {
      title,
      body,
      icon: icon || '/logo.jpg',
      data: { url: url || '/' },
    };

    const results = await Promise.all(entries.map(([id, sub]) => sendTo(id, sub, payload)));
    const sent = results.filter(Boolean).length;

    return NextResponse.json({ success: true, sent, total: entries.length });
  } catch (error: any) {
    console.error('Push broadcast failed:', error);
    return NextResponse.json({ success: false, error: error?.message || 'Unknown error' }, { status: 500 });
  }
}
