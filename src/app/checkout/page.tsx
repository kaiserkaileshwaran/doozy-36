'use client';
import dynamic from 'next/dynamic';
const CheckoutFlow = dynamic(() => import('../../components/customer/CheckoutFlow').then(m => ({ default: m.CheckoutFlow })), { ssr: false });
export default function Page() {
  return <CheckoutFlow />;
}
