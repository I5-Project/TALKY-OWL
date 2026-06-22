'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useHeaderStore } from '@/stores/headerStore';

export default function AboutPage() {
  const router = useRouter();
  const setHeader = useHeaderStore((s) => s.setHeader)
  useEffect(() => {
    setHeader({ variant: 'title', title: '서비스 소개', onBack: () => router.back() })
    return () => setHeader(null)
  }, [])

  return (
    <>
      <main />
    </>
  );
}
