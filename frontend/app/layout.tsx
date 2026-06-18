import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GHWF Student Registration Portal',
  description: 'Student registration portal for Gakkhar Heritage & Welfare Foundation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
