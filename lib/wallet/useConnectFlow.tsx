'use client'

import { useWalletChooser } from '@xcp/wallet-sdk/react'
import { WalletModal } from '@/components/WalletModal'
import { useWallet } from '@/lib/wallet/wallet-context'

/**
 * The one way to ask someone to connect a wallet: one installed wallet
 * connects outright, none opens the install panel, more than one opens the
 * chooser once and the choice is remembered.
 */
export function useConnectFlow() {
  const { status, connecting, connectError } = useWallet()
  const chooser = useWalletChooser()

  return {
    connected: status === 'connected',
    connecting,
    connectError,
    /** Wire to onClick. */
    start: () => void chooser.connect(),
    /** Render somewhere in the tree; null unless a panel is open. */
    walletModal: chooser.open ? <WalletModal chooser={chooser} /> : null,
  }
}
