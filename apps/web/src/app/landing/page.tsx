'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@event-organizer/ui';

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

  const landingLinks = [
    { label: 'Home', href: '/' },
    { label: 'Feature', href: '#feature' },
    { label: 'Price', href: '#price' },
    { label: 'Guest Site', href: '#guest-site' },
  ];

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
      <Header
        links={landingLinks}
        action={
          <button
            onClick={handleAuthNavigation}
            className="flex items-center justify-center bg-[#2E3192] text-white rounded-lg hover:bg-[#2f2f7a] transition-colors px-5 py-4 text-base font-[590]"
            style={{ fontFamily: 'SF Pro, sans-serif' }}
          >
            Sign In
          </button>
        }
      />

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
