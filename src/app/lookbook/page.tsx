'use client';
import dynamic from 'next/dynamic';
const LookbookView = dynamic(() => import('../../components/customer/LookbookView').then(m => ({ default: m.LookbookView })), { ssr: false });
export default function Page() {
  return <LookbookView />;
}
