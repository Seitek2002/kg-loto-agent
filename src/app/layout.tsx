import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from './providers';

export const metadata: Metadata = {
  title: 'KGLOTO.Агент — Продажа лотерейных билетов',
  description: 'Система продажи цифровых лотерейных билетов через агентскую сеть',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full">
      <body className="h-full">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
