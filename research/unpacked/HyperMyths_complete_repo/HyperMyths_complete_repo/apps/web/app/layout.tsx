import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HyperMyths',
  description: 'HyperMyths local-first session-state starter'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
