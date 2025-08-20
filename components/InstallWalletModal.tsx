'use client';

import { Fragment } from 'react';

interface InstallWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstallWalletModal({ isOpen, onClose }: InstallWalletModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            {/* Icon */}
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              XCP Wallet Not Found
            </h3>
            
            <p className="text-sm text-gray-600 mb-6">
              To connect and interact with XCPFOLIO assets, you need to install the XCP Wallet browser extension.
            </p>
            
            {/* Installation options */}
            <div className="space-y-3">
              <a
                href="#"
                className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Chrome Web Store link will be available soon');
                }}
              >
                <div className="flex items-center gap-3">
                  <svg className="h-6 w-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Chrome Web Store</span>
                </div>
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              
              <a
                href="#"
                className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Firefox Add-ons link will be available soon');
                }}
              >
                <div className="flex items-center gap-3">
                  <svg className="h-6 w-6" viewBox="0 0 24 24">
                    <path fill="#FF9500" d="M23.74 8.31c-.18-.68-.46-1.32-.82-1.91l-.02-.03c-.03-.05-.06-.1-.09-.15-.41-.65-.92-1.22-1.51-1.7-1.31-1.06-2.97-1.64-4.71-1.64-1.31 0-2.54.33-3.62.91-.29.16-.57.33-.84.52-.14.1-.28.2-.41.31-.45.37-.85.79-1.2 1.26-.22.3-.42.61-.59.94-.17.33-.32.67-.44 1.02-.08.23-.15.47-.21.71-.06.24-.11.49-.14.74-.04.25-.06.5-.07.76-.01.13-.01.26-.01.39 0 .13 0 .26.01.39.01.26.03.51.07.76.03.25.08.5.14.74.06.24.13.48.21.71.12.35.27.69.44 1.02.17.33.37.64.59.94.35.47.75.89 1.2 1.26.13.11.27.21.41.31.27.19.55.36.84.52 1.08.58 2.31.91 3.62.91 1.74 0 3.4-.58 4.71-1.64.59-.48 1.1-1.05 1.51-1.7.03-.05.06-.1.09-.15l.02-.03c.36-.59.64-1.23.82-1.91.09-.34.16-.69.2-1.05.02-.18.04-.36.05-.54.01-.18.02-.36.02-.54s-.01-.36-.02-.54c-.01-.18-.03-.36-.05-.54-.04-.36-.11-.71-.2-1.05z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">Firefox Add-ons</span>
                </div>
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              
              <a
                href="#"
                className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  alert('GitHub releases link will be available soon');
                }}
              >
                <div className="flex items-center gap-3">
                  <svg className="h-6 w-6" viewBox="0 0 24 24">
                    <path fill="#24292e" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                  <span className="text-sm font-medium text-gray-700">GitHub (Manual Install)</span>
                </div>
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-3">
                Once installed, refresh this page and click Connect Wallet again.
              </p>
              
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}