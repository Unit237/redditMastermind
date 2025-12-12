import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Reddit MasterMind',
  description: 'Reddit engagement calendar planner',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}