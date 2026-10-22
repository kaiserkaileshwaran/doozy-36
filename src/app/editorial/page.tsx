'use client';
import dynamic from 'next/dynamic';
const EditorialView = dynamic(() => import('../../components/customer/EditorialView').then(m => ({ default: m.EditorialView })), { ssr: false });
export default function Page() {
  return <EditorialView />;
}
