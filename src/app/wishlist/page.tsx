'use client';
import dynamic from 'next/dynamic';
const WishlistPage = dynamic(() => import('../../components/customer/WishlistPage').then(m => ({ default: m.WishlistPage })), { ssr: false });
export default function Page() {
  return <WishlistPage />;
}
