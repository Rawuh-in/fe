'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const router = useRouter();

  // Check if user is authenticated and navigate accordingly
  const handleAuthNavigation = () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-white text-black overflow-hidden font-sans relative w-full">
      {/* Background Blobs */}
      <div
        className="absolute rounded-full pointer-events-none filter blur-[150px]"
        style={{
          width: '571px',
          height: '679px',
          left: '-255px',
          top: '356px',
          background:
            'linear-gradient(180deg, rgba(46, 49, 146, 0.3) 0%, rgba(151, 71, 255, 0.3) 100%)',
        }}
      />
      <div
        className="absolute rounded-full pointer-events-none filter blur-[100px]"
        style={{
          width: '879.4px',
          height: '891.46px',
          left: '806px',
          top: '324px',
          background:
            'linear-gradient(128.4deg, rgba(151, 71, 255, 0.3) 3.87%, rgba(46, 49, 146, 0) 83.09%)',
        }}
      />

      {/* Header */}
      <header
        className="absolute top-0 left-0 w-full bg-white border-b border-[#2E3192] flex items-center justify-center z-50"
        style={{ height: '83px', gap: '425px' }}
      >
        {/* Logo Placeholder */}
        <div
          className="flex items-center justify-center"
          style={{ width: '184px', height: '60px' }}
        >
          <div className="flex items-center gap-1">
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
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex items-center" style={{ gap: '15px' }}>
          {['Home', 'Feature', 'Price', 'Guest Site'].map((item) => (
            <Link
              key={item}
              href={item === 'Home' ? '/' : `#${item.toLowerCase().replace(' ', '-')}`}
              className="flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity text-black"
              style={{
                padding: '16px 20px',
                fontSize: '16px',
                fontWeight: 590,
                fontFamily: 'SF Pro, sans-serif',
              }}
            >
              {item}
            </Link>
          ))}

          <button
            onClick={handleAuthNavigation}
            className="flex items-center justify-center bg-[#2E3192] text-white rounded-lg hover:bg-[#2f2f7a] transition-colors"
            style={{
              width: '94px',
              height: '51px',
              padding: '16px 20px',
              fontSize: '16px',
              fontWeight: 590,
              fontFamily: 'SF Pro, sans-serif',
            }}
          >
            Sign In
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative w-full h-full max-w-[1440px] mx-auto">
        {/* Hero Text */}
        <div
          className="absolute z-10"
          style={{
            width: '548px',
            height: '363px',
            left: '139px',
            top: '231px',
          }}
        >
          <h1
            className="text-black"
            style={{
              fontFamily: 'SF Pro, sans-serif',
              fontStyle: 'normal',
              fontWeight: 590,
              fontSize: '88px',
              lineHeight: '105px',
            }}
          >
            The Smartest Way to Invite and Welcome Your Guests
          </h1>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleAuthNavigation}
          className="absolute flex items-center justify-center bg-[#2E3192] text-white rounded-lg hover:bg-[#2f2f7a] transition-all hover:-translate-y-0.5 shadow-lg"
          style={{
            width: '221px',
            height: '68px',
            left: '144px',
            top: '702px',
            padding: '16px 20px',
            gap: '10px',
          }}
        >
          <span
            style={{
              fontFamily: 'SF Pro, sans-serif',
              fontWeight: 590,
              fontSize: '24px',
              lineHeight: '29px',
            }}
          >
            Get Started
          </span>
        </button>

        {/* Hand Image */}
        <div
          className="absolute"
          style={{
            width: '594px',
            height: '831px',
            left: '830px',
            top: '121px',
            backgroundImage: 'url(/assets/hand.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        />
      </main>
    </div>
  );
}
