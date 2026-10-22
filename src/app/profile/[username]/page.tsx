'use client';
import dynamic from 'next/dynamic';
const PublicProfileView = dynamic(() => import('../../../components/customer/PublicProfileView').then(m => ({ default: m.PublicProfileView })), { ssr: false });
export default function Page() {
  return <PublicProfileView />;
}
