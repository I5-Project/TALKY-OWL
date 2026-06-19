'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';

export default function ProfileEditPage() {
  const router = useRouter();

  return (
    <>
      <Header title="개인정보 수정" onBack={() => router.back()} />
      <main />
    </>
  );
}
