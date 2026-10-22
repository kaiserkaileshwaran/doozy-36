'use client';
import dynamic from 'next/dynamic';
const TrackOrderPage = dynamic(() => import('../../components/customer/TrackOrderPage').then(m => ({ default: m.TrackOrderPage })), { ssr: false });
export default function Page() {
  return <TrackOrderPage />;
}
