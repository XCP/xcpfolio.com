'use client';

import { useWeb3 } from '@/contexts/Web3Context';

export function WalletButton() {
  const { isConnected, account, connecting, error, connect, disconnect } = useWeb3();

  if (isConnected && account) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          {account.slice(0, 6)}...{account.slice(-4)}
        </span>
        <button
          onClick={disconnect}
          className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {error && (
        <span className="text-sm text-red-600" title={error}>
          ⚠️
        </span>
      )}
      <button
        onClick={connect}
        disabled={connecting}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {connecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    </div>
  );
}