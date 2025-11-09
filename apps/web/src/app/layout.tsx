import type { Metadata } from 'next';
import { appConfig } from '@event-organizer/config';
import { ClientProviders } from './providers/client-providers';
import './globals.css';

// Using system fonts as fallback due to network constraints
const geistSans = {
  variable: '--font-geist-sans',
  className: 'font-sans',
};

const geistMono = {
  variable: '--font-geist-mono',
  className: 'font-mono',
};

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
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
