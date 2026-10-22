'use client';
import dynamic from 'next/dynamic';
const BagPage = dynamic(() => import('../../components/customer/BagPage').then(m => ({ default: m.BagPage })), { ssr: false });
export default function Page() {
  return <BagPage />;
}
