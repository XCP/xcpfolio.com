'use client'

import type { ReactNode } from 'react'
import {
  type WalletReadyState,
  WalletProvider as SdkWalletProvider,
  useWallet as useSdkWallet,
} from '@xcp/wallet-sdk/react'
import { CASATOOKAN_WALLET, discoverWallets, KNOWN_WALLETS } from '@xcp/wallet-sdk/web'

/** The site's vocabulary. `locked` reads as connected: the grant stands, and a signing call opens the unlock screen. */
export type XcpWalletStatus = 'not_detected' | 'disconnected' | 'connected'

const STATUS: Record<WalletReadyState, XcpWalletStatus> = {
  detecting: 'not_detected',
  not_installed: 'not_detected',
  disconnected: 'disconnected',
  connected: 'connected',
  locked: 'connected',
  // The wallet was updated under this page: signing is off, and the connect button reloads the page.
  reload_required: 'disconnected',
}

const wallets = discoverWallets(
  process.env.NEXT_PUBLIC_CASATOOKAN_ENABLED === 'true'
    ? [...KNOWN_WALLETS, CASATOOKAN_WALLET]
    : KNOWN_WALLETS,
)

export function WalletProvider({ children }: { children: ReactNode }) {
  return <SdkWalletProvider wallets={wallets}>{children}</SdkWalletProvider>
}

export function useWallet() {
  const wallet = useSdkWallet()
  return { ...wallet, status: STATUS[wallet.readyState] }
}
