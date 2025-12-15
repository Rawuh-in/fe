'use client';

import Link from 'next/link';
import clsx from 'clsx';
import type { ReactNode, HTMLAttributes } from 'react';

const baseStyles =
  'w-full bg-white/80 backdrop-blur-sm border-b border-[#2E3192] flex items-center justify-between px-8 py-4 z-50 h-[83px]';

export type HeaderLink = {
  label: string;
  href: string;
};

export type HeaderProps = HTMLAttributes<HTMLElement> & {
  links: HeaderLink[];
  action: ReactNode;
  logoHref?: string;
};

export function Header({
  className,
  links,
  action,
  logoHref = '/',
  ...props
}: HeaderProps) {
  return (
    <header className={clsx(baseStyles, className)} {...props}>
      {/* Logo */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Link href={logoHref as any} className="flex items-center gap-1">
        <span className="text-2xl font-bold text-[#2E3192]">rawuh</span>
        <div className="w-8 h-8 bg-[#2E3192] rounded-lg flex items-center justify-center text-white text-xs font-bold">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex items-center gap-4">
        {links.map((link) => (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <Link
            key={link.label}
            href={link.href as any}
            className="px-5 py-4 text-base font-[590] opacity-50 hover:opacity-100 transition-opacity text-black"
            style={{ fontFamily: 'SF Pro, sans-serif' }}
          >
            {link.label}
          </Link>
        ))}

        {action}
      </nav>
    </header>
  );
}
