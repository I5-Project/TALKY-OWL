'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/layout/Header';

export default function DiaryDetailHeader() {
  const router = useRouter();
  return <Header variant="title" title="일기 조회" onBack={() => router.push('/calendar')} />;
}
