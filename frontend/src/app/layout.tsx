import type { Metadata } from 'next';
import '../index.css';

export const metadata: Metadata = {
  title: 'SUNDAY BAZAR - Instant Classifieds Portal',
  description: 'The premier location-aware bargain bazaar for classified ads, powered by Firebase and Google Sign-In.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
