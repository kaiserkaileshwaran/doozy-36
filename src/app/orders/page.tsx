'use client';
import dynamic from 'next/dynamic';
const AccountView = dynamic(() => import('../../components/customer/AccountView').then(m => ({ default: m.AccountView })), { ssr: false });
export default function Page() {
  return <AccountView />;
}
