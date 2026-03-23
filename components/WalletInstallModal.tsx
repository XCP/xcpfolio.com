'use client'

import { createPortal } from 'react-dom'

const XCP_WALLET_URL = 'https://chromewebstore.google.com/detail/xcp-wallet/nicpjdbehgcjbjfjkobcidnfmfpijohg'

interface WalletInstallModalProps {
  onClose: () => void
}

export function WalletInstallModal({ onClose }: WalletInstallModalProps) {
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white border border-gray-200 rounded-lg p-5 max-w-sm w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
            <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <path d="M12 12h.01" />
              <path d="M17 12h.01" />
              <path d="M7 12h.01" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">XCP Wallet Required</h3>
            <p className="text-xs text-gray-500 mt-1">Install the XCP Wallet Chrome extension to connect your wallet.</p>
          </div>
        </div>
        <a
          href={XCP_WALLET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Install from Chrome Web Store
        </a>
        <button
          onClick={onClose}
          className="w-full mt-2 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>,
    document.body
  )
}
