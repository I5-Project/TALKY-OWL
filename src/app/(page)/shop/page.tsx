'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToastStore } from '@/stores/toastStore';
import { useHeaderStore } from '@/stores/headerStore';
import Toast from '@/components/feedback/Toast';

export default function ShopPage() {
  const router = useRouter();
  const setHeader = useHeaderStore((s) => s.setHeader)
  useEffect(() => {
    setHeader({ variant: 'title', title: '상점', onBack: () => router.back() })
    return () => setHeader(null)
  }, [])
  const show = useToastStore((s) => s.show);

  useEffect(() => {
    show('준비중입니다');
  }, [show]);

  return (
    <>
      <main />
      <Toast />
    </>
  );
}
