'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';

export default function WithdrawPage() {
  const router = useRouter();

  return (
    <>
      <Header title="회원탈퇴" onBack={() => router.back()} />
      <main />
    </>
  );
}
