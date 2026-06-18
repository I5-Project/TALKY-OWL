'use client';

// TanStack Query는 Server Component인 layout.tsx에서 직접 초기화할 수 없으므로
// 'use client' 래퍼 컴포넌트를 통해 QueryClientProvider를 주입한다.
// useState로 초기화해야 요청마다 새 인스턴스가 생기지 않는다.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
