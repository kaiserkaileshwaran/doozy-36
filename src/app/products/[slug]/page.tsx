'use client';
import dynamic from 'next/dynamic';
const ProductDetailPage = dynamic(() => import('../../../components/customer/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })), { ssr: false });
export default function Page() {
  return <ProductDetailPage />;
}
