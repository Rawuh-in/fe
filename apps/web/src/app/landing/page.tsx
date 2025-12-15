'use client';

import Link from 'next/link';
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
    <div className="min-h-screen bg-white text-black overflow-hidden font-sans relative w-full flex flex-col">
      {/* Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute rounded-full filter blur-[150px]"
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
          className="absolute rounded-full filter blur-[100px]"
          style={{
            width: '879.4px',
            height: '891.46px',
            left: '806px',
            top: '324px',
            background:
              'linear-gradient(128.4deg, rgba(151, 71, 255, 0.3) 3.87%, rgba(46, 49, 146, 0) 83.09%)',
          }}
        />
      </div>

      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-sm border-b border-[#2E3192] flex items-center justify-between px-8 py-4 z-50 h-[83px]">
        {/* Logo */}
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

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          {['Home', 'Feature', 'Price', 'Guest Site'].map((item) => (
            <Link
              key={item}
              href={item === 'Home' ? '/' : `#${item.toLowerCase().replace(' ', '-')}`}
              className="px-5 py-4 text-base font-[590] opacity-50 hover:opacity-100 transition-opacity text-black"
              style={{ fontFamily: 'SF Pro, sans-serif' }}
            >
              {item}
            </Link>
          ))}

          <button
            onClick={handleAuthNavigation}
            className="flex items-center justify-center bg-[#2E3192] text-white rounded-lg hover:bg-[#2f2f7a] transition-colors px-5 py-4 text-base font-[590]"
            style={{ fontFamily: 'SF Pro, sans-serif' }}
          >
            Sign In
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center max-w-[1440px] mx-auto w-full px-8 z-10 relative">
        {/* Left Column: Text & CTA */}
        <div className="flex-1 flex flex-col items-start justify-center gap-10 lg:pl-20">
          <h1
            className="text-black max-w-[548px]"
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

          <button
            onClick={handleAuthNavigation}
            className="flex items-center justify-center bg-[#2E3192] text-white rounded-lg hover:bg-[#2f2f7a] transition-all hover:-translate-y-0.5 shadow-lg px-5 py-4 gap-2.5"
            style={{
              width: '221px',
              height: '68px',
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
        </div>

        {/* Right Column: Image */}
        <div className="flex-1 flex items-center justify-center h-full relative min-h-[600px] w-full">
          <div
            className="w-full h-full absolute inset-0"
            style={{
              backgroundImage: 'url(/assets/hand.png)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            }}
          />
        </div>
      </main>
    </div>
  );
}
