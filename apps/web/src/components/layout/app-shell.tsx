'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@event-organizer/ui';
import { useState } from 'react';
import clsx from 'clsx';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/' },
    { name: 'Events', href: '/admin/events' },
    { name: 'Users', href: '/admin/users' },
    { name: 'Guests', href: '/admin/guests' },
    { name: 'Check-in', href: '/checkin' },
    { name: 'QR Manager', href: '/qr' },
  ];

  return (
    <div className="min-h-screen bg-[var(--eo-bg)]">
      <nav className="bg-[var(--eo-bg-elevated)] shadow-[var(--eo-shadow-sm)] border-b border-[var(--eo-muted)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-[var(--eo-primary)]">
                  🎉 EO Console
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={clsx(
                      'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors',
                      pathname === item.href
                        ? 'border-[var(--eo-primary)] text-[var(--eo-fg)]'
                        : 'border-transparent text-[var(--eo-muted-text)] hover:text-[var(--eo-fg)] hover:border-[var(--eo-muted)]'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden sm:flex items-center">
              <Button variant="ghost" onClick={logout} size="md">
                Logout
              </Button>
            </div>
            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-[var(--eo-muted-text)] hover:bg-[var(--eo-bg)]"
              >
                <span className="sr-only">Open menu</span>
                {isMobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-[var(--eo-muted)]">
            <div className="pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={clsx(
                    'block pl-3 pr-4 py-2 border-l-4 text-base font-medium',
                    pathname === item.href
                      ? 'bg-[color:var(--eo-primary)_10%] border-[var(--eo-primary)] text-[var(--eo-primary)]'
                      : 'border-transparent text-[var(--eo-muted-text)] hover:bg-[var(--eo-bg)]'
                  )}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 pb-3 border-t border-[var(--eo-muted)]">
                <button
                  onClick={logout}
                  className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-[var(--eo-danger)]"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
