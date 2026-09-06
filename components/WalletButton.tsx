'use client'

import { useWallet } from '@/lib/wallet/wallet-context'
import { useConnectFlow } from '@/lib/wallet/useConnectFlow'

export function WalletButton() {
  const { status, address, disconnect, accounts, switchAccount } = useWallet()
  const wallet = useConnectFlow()

  if (status !== 'connected') {
    return (
      <>
        <button
          onClick={wallet.start}
          disabled={wallet.connecting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Connect wallet"
          aria-busy={wallet.connecting}
        >
          {wallet.connecting ? 'Connecting...' : <><span className="sm:hidden">Connect</span><span className="hidden sm:inline">Connect Wallet</span></>}
        </button>
        {wallet.walletModal}
      </>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {accounts.length > 1 ? (
        <select
          value={address ?? ''}
          onChange={(e) => void switchAccount(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-700 font-mono"
          aria-label="Wallet address"
        >
          {accounts.map((account) => (
            <option key={account} value={account}>
              {account.slice(0, 6)}...{account.slice(-4)}
            </option>
          ))}
        </select>
      ) : (
        <span className="text-sm text-gray-600 font-mono">
          {address!.slice(0, 6)}...{address!.slice(-4)}
        </span>
      )}
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
