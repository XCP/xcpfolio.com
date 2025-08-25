'use client';

import Link from 'next/link';
import Image from 'next/image';
import { WalletButton } from './WalletButton';

interface HeaderProps {
  totalAssets?: number;
  soldAssets?: number;
  showOrderStatus?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function Header({ totalAssets, soldAssets, showOrderStatus = true, showBackButton = false, onBack }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and tagline */}
          <div className="flex items-baseline gap-3">
              <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors relative" aria-label="XCPFOLIO Homepage">
                XCPFOLIO
                <Image 
                  src="/XCP.png" 
                  alt="XCP" 
                  width={16} 
                  height={16}
                  className="absolute -top-0.5 -right-4 w-4 h-4"
                />
              </Link>
              <span className="hidden sm:inline text-sm text-gray-500 ml-2">Asset Name Dispensers</span>
            </div>

          {/* Right side - Stats and wallet */}
          <div className="flex items-center gap-4">
            {showBackButton && onBack && (
              <button
                onClick={onBack}
                className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Go Back
              </button>
            )}
            {totalAssets && totalAssets > 0 && soldAssets !== undefined && soldAssets > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="text-sm font-medium text-gray-700">{soldAssets} of {totalAssets.toLocaleString()} sold!</span>
              </div>
            )}
            {showOrderStatus && (
              <Link 
                href="/status"
                className="hidden sm:flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Order Status
              </Link>
            )}
            <WalletButton />
          </div>
        </div>

        {/* Mobile stats bar */}
        {totalAssets && totalAssets > 0 && soldAssets !== undefined && soldAssets > 0 && (
          <div className="sm:hidden border-t border-gray-100 py-2">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">{soldAssets} of {totalAssets.toLocaleString()} sold!</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}