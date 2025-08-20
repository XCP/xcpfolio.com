import Link from 'next/link';
import { CacheBuster } from './CacheBuster';

export function Footer() {
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
        
        <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
          <div className="flex-1"></div>
          <p className="text-xs text-gray-500 text-center">
            © {new Date().getFullYear()} XCPFOLIO
          </p>
          <div className="flex-1 flex justify-end">
            <a 
              href="https://21e14.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              This is a 21e14 project. <span className="text-red-500">❤️</span>
            </a>
          </div>
        </div>
      </div>
      <CacheBuster />
    </footer>
  );
}