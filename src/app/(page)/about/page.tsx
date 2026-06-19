'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';

export default function AboutPage() {
  const router = useRouter();

  return (
    <>
      <Header title="서비스 소개" onBack={() => router.back()} />
      <main />
    </>
  );
}
