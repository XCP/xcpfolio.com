'use client'

import { createPortal } from 'react-dom'
import Image from 'next/image'
import type { WalletChooserState } from '@xcp/wallet-sdk/react'

/**
 * Store links when no wallet is installed, a choice when more than one is.
 * Every supported wallet is listed either way, recommended first.
 */
export function WalletModal({ chooser }: { chooser: WalletChooserState }) {
  const installing = chooser.action === 'install'
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40" onClick={chooser.close}>
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
            <h3 className="text-sm font-semibold text-gray-900">{installing ? 'Wallet Required' : 'Choose a Wallet'}</h3>
            <p className="text-xs text-gray-500 mt-1">
              {installing
                ? 'Install a Counterparty wallet extension to connect.'
                : 'More than one wallet is installed. Pick the one to connect with.'}
            </p>
          </div>
        </div>
        <ul className="space-y-2">
          {chooser.candidates.map((wallet, index) => (
            <li key={wallet.id} className="flex items-center gap-3 rounded-lg border border-gray-200 px-3 py-2">
              {wallet.icon ? (
                <Image src={wallet.icon} alt="" width={28} height={28} className="h-7 w-7 rounded-md" unoptimized />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gray-100 text-xs text-gray-700">
                  {wallet.name.charAt(0)}
                </span>
              )}
              <span className="flex-1 text-sm text-gray-900">
                {wallet.name}
                {index === 0 && (
                  <span className="ml-2 text-[10px] uppercase tracking-wide text-blue-600">Recommended</span>
                )}
              </span>
              {wallet.installed ? (
                <button
                  onClick={() => void chooser.choose(wallet.id)}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Connect
                </button>
              ) : (
                <a
                  href={wallet.installUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Install
                </a>
              )}
            </li>
          ))}
        </ul>
        <button
          onClick={chooser.close}
          className="w-full mt-2 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>,
    document.body,
  )
}
