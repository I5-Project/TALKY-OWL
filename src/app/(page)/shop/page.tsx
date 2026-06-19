'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToastStore } from '@/stores/toastStore';
import Header from '@/components/layout/Header';
import Toast from '@/components/feedback/Toast';

export default function ShopPage() {
  const router = useRouter();
  const show = useToastStore((s) => s.show);

  useEffect(() => {
    show('준비중입니다');
  }, [show]);

  return (
    <>
      <Header title="상점" onBack={() => router.back()} />
      <main />
      <Toast />
    </>
  );
}
