'use client'

import { useState } from 'react'
import { useWallet } from '@/lib/wallet/wallet-context'
import { WalletInstallModal } from '@/components/WalletInstallModal'

export function WalletButton() {
  const { status, address, connecting, connect, disconnect } = useWallet()
  const [showInstall, setShowInstall] = useState(false)

  if (status === 'not_detected') {
    return (
      <>
        <button
          onClick={() => {
            if (window.xcpwallet) {
              connect()
            } else {
              setShowInstall(true)
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          aria-label="Connect XCP wallet"
        >
          <span className="sm:hidden">Connect</span>
          <span className="hidden sm:inline">Connect Wallet</span>
        </button>
        {showInstall && <WalletInstallModal onClose={() => setShowInstall(false)} />}
      </>
    )
  }

  if (status === 'disconnected') {
    return (
      <button
        onClick={connect}
        disabled={connecting}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Connect XCP wallet"
        aria-busy={connecting}
      >
        {connecting ? 'Connecting...' : <><span className="sm:hidden">Connect</span><span className="hidden sm:inline">Connect Wallet</span></>}
      </button>
    )
  }

  // Connected
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 font-mono">
        {address!.slice(0, 6)}...{address!.slice(-4)}
      </span>
      <button
        onClick={disconnect}
        className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
        aria-label="Disconnect wallet"
      >
        Disconnect
      </button>
    </div>
  )
}
