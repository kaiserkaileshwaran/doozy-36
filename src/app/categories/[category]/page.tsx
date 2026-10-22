'use client';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

const ProductListingPage = dynamic(() => import('../../../components/customer/ProductListingPage').then(m => ({ default: m.ProductListingPage })), { ssr: false });

export default function Page() {
  const params = useParams();
  const category = params?.category ? decodeURIComponent(params.category as string) : undefined;
  return <ProductListingPage initialCategory={category} />;
}
