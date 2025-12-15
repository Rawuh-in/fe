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
    <div className="min-h-screen bg-white text-gray-900 overflow-hidden font-sans">
      {/* Background decorative elements - Soft blurs for the "glow" effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-white" />
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-purple-100/50 rounded-full blur-3xl opacity-60" />
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[80%] bg-blue-50/50 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-0 left-1/3 w-[50%] h-[50%] bg-pink-50/30 rounded-full blur-3xl opacity-40" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-6 py-6 md:px-12 lg:px-20 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-indigo-900">rawuh</span>
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
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

          <div className="hidden md:flex items-center gap-8 text-gray-500 font-medium text-sm">
            <Link href="/" className="text-gray-900">
              Home
            </Link>
            <Link href="#features" className="hover:text-gray-900 transition-colors">
              Feature
            </Link>
            <Link href="#pricing" className="hover:text-gray-900 transition-colors">
              Price
            </Link>
            <Link href="#guest-site" className="hover:text-gray-900 transition-colors">
              Guest Site
            </Link>
          </div>

          <button
            onClick={handleAuthNavigation}
            className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-[#3b3b98] text-white hover:bg-[#2f2f7a] transition-colors shadow-md shadow-indigo-200 cursor-pointer"
          >
            Sign In
          </button>
        </nav>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col lg:flex-row items-center justify-center px-6 md:px-12 lg:px-20 max-w-7xl mx-auto w-full gap-12 lg:gap-20 pt-8 pb-20">
          {/* Left - Text Content */}
          <div className="flex-1 space-y-8 text-center lg:text-left max-w-2xl lg:max-w-none">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-gray-900">
              The Smartest
              <br />
              Way to Invite
              <br />
              and Welcome
              <br />
              Your Guests
            </h1>

            <div className="pt-4 flex justify-center lg:justify-start">
              <button
                onClick={handleAuthNavigation}
                className="px-8 py-4 rounded-lg bg-[#3b3b98] text-white font-semibold text-lg hover:bg-[#2f2f7a] transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Right - Hand Image */}
          <div className="flex-1 relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[500px] aspect-[3/4]">
              <Image
                src="/assets/hand.png"
                alt="Hand holding phone showing app interface"
                fill
                className="object-contain drop-shadow-2xl"
                priority
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
