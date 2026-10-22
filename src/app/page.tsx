'use client';
import dynamic from 'next/dynamic';
const Homepage = dynamic(() => import('../components/customer/Homepage').then(m => ({ default: m.Homepage })), { ssr: false });
export default function Page() {
  return <Homepage />;
}
