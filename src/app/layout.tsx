import type { Metadata } from 'next';
import localFont from 'next/font/local';
import AuthProvider from '@/components/providers/AuthProvider';
import QueryProvider from '@/components/providers/QueryProvider';
import Toast from '@/components/feedback/Toast';
import { getCachedSession } from '@/lib/auth/getSession';
import './globals.scss';

const pretendard = localFont({
  src: '../../public/fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  weight: '100 900',
  display: 'swap',
});

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ??
  (process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3030')

export const metadata: Metadata = {
  title: '말해부엉',
  description: 'AI 갈등 조정 판결 서비스',
  icons: {
    icon: '/images/common/favicon.svg',
  },
  openGraph: {
    title: '말해부엉',
    description: 'AI 갈등 조정 판결 서비스',
    images: baseUrl
      ? [
          {
            url: `${baseUrl}/images/common/ogimg.jpg`,
            width: 1200,
            height: 630,
            alt: '말해부엉',
          },
        ]
      : [],
  },
};

async function SessionBridge({ children }: { children: React.ReactNode }) {
  const session = await getCachedSession();
  return <AuthProvider session={session}>{children}</AuthProvider>;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={pretendard.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <SessionBridge>
          <QueryProvider>
            {children}
            <Toast />
          </QueryProvider>
        </SessionBridge>
      </body>
    </html>
  );
}
