import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Custom Activity - SFMC Journey Builder',
  description: 'Salesforce Marketing Cloud Custom Activity for Journey Builder',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Allow loading in SFMC iframe */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </head>
      <body className="bg-white">{children}</body>
    </html>
  );
}
