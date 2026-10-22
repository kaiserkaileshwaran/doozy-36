'use client';
import dynamic from 'next/dynamic';
const AuthScreen = dynamic(() => import('../../components/customer/AuthScreen').then(m => ({ default: m.AuthScreen })), { ssr: false });
export default function Page() {
  return <AuthScreen />;
}
