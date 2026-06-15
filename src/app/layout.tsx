import type { Metadata } from 'next';
import './globals.scss';

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
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
