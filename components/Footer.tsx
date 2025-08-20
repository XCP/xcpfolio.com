'use client';

import Link from 'next/link';
import { CacheBuster } from './CacheBuster';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left - Brand */}
          <div>
            <h3 className="font-bold text-gray-900 mb-2">XCPFOLIO</h3>
            <p className="text-sm text-gray-600">
              Buy and own Counterparty asset names.
            </p>
          </div>
          
          {/* Center - Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Resources</h4>
            <ul className="space-y-1">
              <li>
                <Link href="/how-it-works" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <a href="https://counterparty.io" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Counterparty Protocol
                </a>
              </li>
              <li>
                <a href="https://xcp.io" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  XCP Explorer
                </a>
              </li>
            </ul>
          </div>
          
          {/* Right - Contact */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Contact</h4>
            <ul className="space-y-1">
              <li>
                <a href="mailto:dan@droplister.com" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Email Support
                </a>
              </li>
              <li>
                <a href="https://github.com/XCP/xcpfolio.com" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Desktop footer bottom */}
        <div className="mt-8 pt-6 border-t border-gray-200 hidden md:flex items-center justify-between">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} XCPFOLIO
          </p>
          <button
            onClick={scrollToTop}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
            aria-label="Back to top"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            Back to top
          </button>
          <a 
            href="https://21e14.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            This is a 21e14 project. <span className="text-red-500">❤️</span>
          </a>
        </div>

        {/* Mobile footer bottom */}
        <div className="mt-8 pt-6 border-t border-gray-200 md:hidden">
          <p className="text-xs text-gray-500 text-center mb-2">
            © {new Date().getFullYear()} XCPFOLIO
          </p>
          <p className="text-xs text-gray-500 text-center">
            <a 
              href="https://21e14.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-gray-700 transition-colors"
            >
              This is a 21e14 project. <span className="text-red-500">❤️</span>
            </a>
          </p>
        </div>
      </div>
      
      {/* Only show CacheBuster in development */}
      {process.env.NODE_ENV === 'development' && <CacheBuster />}
    </footer>
  );
}