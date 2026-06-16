import type { Metadata } from 'next';
import localFont from 'next/font/local';
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
