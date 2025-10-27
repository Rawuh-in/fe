import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { appConfig } from '@event-organizer/config';
import { ClientProviders } from './providers/client-providers';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: `${appConfig.appName} Console`,
  description:
    'Operational console for event organizers to manage check-in, stages, and reporting.',
  applicationName: appConfig.appName,
  appleWebApp: {
    statusBarStyle: 'default',
    capable: true,
  },
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[color:var(--eo-bg)] text-[color:var(--eo-fg)]`}
      >
        <ClientProviders />
        {children}
      </body>
    </html>
  );
}
