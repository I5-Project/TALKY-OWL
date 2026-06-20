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

export const metadata: Metadata = {
  title: 'TALKY-OWL',
  description: 'AI 갈등 조정 판결 서비스',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCachedSession();
  return (
    <html lang="ko" className={pretendard.variable} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider session={session}>
          <QueryProvider>
            <main className="container">{children}</main>
            <Toast />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
