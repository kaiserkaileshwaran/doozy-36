'use client';
import dynamic from 'next/dynamic';
const ProductListingPage = dynamic(() => import('../../components/customer/ProductListingPage').then(m => ({ default: m.ProductListingPage })), { ssr: false });
export default function Page() {
  return <ProductListingPage />;
}
