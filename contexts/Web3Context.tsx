'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { InstallWalletModal } from '@/components/InstallWalletModal';
import { composeOrderTransaction } from '@/lib/api';

// Define the XCP Wallet provider interface
interface XCPWalletProvider {
  isConnected?: () => boolean;
  request?: (args: { method: string; params?: any[] }) => Promise<any>;
  on?: (event: string, handler: (data: any) => void) => void;
  off?: (event: string, handler: (data: any) => void) => void;
  enable?: () => Promise<string[]>; // Legacy support
  // Add any other methods that might be available
  [key: string]: any;
}

interface Web3ContextType {
  provider: XCPWalletProvider | null;
  isConnected: boolean;
  account: string | null;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  composeOrder: (params: {
    give_asset: string;
    give_quantity: number;
    get_asset: string;
    get_quantity: number;
    expiration?: number;
    sat_per_vbyte?: number;
  }) => Promise<any>;
  signAndBroadcast: (rawTransaction: string) => Promise<{ txid: string }>;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const connectingRef = useRef(false);

  // Check if XCP wallet is available
  const getProvider = useCallback((): XCPWalletProvider | null => {
    if (typeof window !== 'undefined') {
      const xcpwallet = (window as any).xcpwallet;
      
      console.log('Available providers:', {
        xcpwallet: !!xcpwallet,
        xcpwalletMethods: xcpwallet ? Object.getOwnPropertyNames(xcpwallet) : []
      });
      
      return xcpwallet || null;
    }
    return null;
  }, []);

  // Handle account changes
  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts && Array.isArray(accounts) && accounts.length > 0) {
      setAccount(accounts[0]);
      setIsConnected(true);
      setError(null); // Clear any previous errors on successful connection
    } else {
      setAccount(null);
      setIsConnected(false);
    }
  }, []);

  // Handle disconnect
  const handleDisconnect = useCallback(() => {
    setAccount(null);
    setIsConnected(false);
  }, []);

  // Check initial connection
  useEffect(() => {
    // Track cleanup functions for provider event listeners
    let providerCleanup: (() => void) | null = null;

    const setupProviderEvents = (provider: XCPWalletProvider) => {
      // Check if already connected using official XCP Wallet API
      const checkConnection = async () => {
        if (!provider.request) {
          console.log('Provider does not support request method');
          return;
        }

        try {
          // Check existing connection with xcp_accounts
          const accounts = await provider.request({ method: 'xcp_accounts' });
          console.log('Initial check - xcp_accounts:', accounts);

          if (accounts && Array.isArray(accounts) && accounts.length > 0) {
            handleAccountsChanged(accounts);
          } else {
            // Provider is available and responding, clear any stale errors
            setError(null);
          }
        } catch (err) {
          // Ignore errors on initial check - don't set error state
          // as this is just checking if already connected
          console.log('Initial connection check failed:', err);
        }
      };

      checkConnection();

      // Set up event listeners using official XCP Wallet API
      if (typeof provider.on === 'function') {
        provider.on('accountsChanged', handleAccountsChanged);
        provider.on('disconnect', handleDisconnect);
      }

      // Return cleanup function
      return () => {
        // XCP Wallet supports both removeListener and off
        const removeMethod = provider.removeListener || provider.off;
        if (typeof removeMethod === 'function') {
          removeMethod.call(provider, 'accountsChanged', handleAccountsChanged);
          removeMethod.call(provider, 'disconnect', handleDisconnect);
        }
      };
    };

    const initializeProvider = () => {
      const provider = getProvider();
      if (!provider) {
        console.log('No provider found');
        return;
      }

      console.log('Setting up provider events');
      // Clean up any existing listeners before setting up new ones
      if (providerCleanup) {
        providerCleanup();
      }
      providerCleanup = setupProviderEvents(provider);
    };

    // Listen for wallet initialization
    const handleWalletInit = () => {
      console.log('XCP Wallet initialized event received');
      // Small delay to ensure provider is fully set up
      setTimeout(initializeProvider, 100);
    };

    // Listen for the wallet initialization event
    window.addEventListener('xcp-wallet#initialized', handleWalletInit);

    // Initial check
    const provider = getProvider();
    if (provider) {
      providerCleanup = setupProviderEvents(provider);
    } else {
      console.log('Provider not found on initial load, waiting for xcp-wallet#initialized event');
    }

    return () => {
      window.removeEventListener('xcp-wallet#initialized', handleWalletInit);
      // Clean up provider event listeners
      if (providerCleanup) {
        providerCleanup();
      }
    };
  }, [getProvider, handleAccountsChanged, handleDisconnect]);

  // Connect wallet
  const connect = useCallback(async () => {
    const provider = getProvider();
    if (!provider) {
      setError('XCP Wallet not found. Please install the extension.');
      setShowInstallModal(true);
      return;
    }
    
    // Prevent double connection attempts
    if (connectingRef.current) {
      console.log('Connection already in progress, skipping...');
      return;
    }

    connectingRef.current = true;
    setConnecting(true);
    setError(null);

    try {
      console.log('Attempting to connect to XCP Wallet...');
      
      if (!provider.request && !provider.enable) {
        throw new Error('XCP Wallet provider does not support connection methods');
      }
      
      // Request accounts using the standard provider.request method
      console.log('Requesting accounts from XCP Wallet...');
      console.log('Current origin:', window.location.origin);

      let accounts = null;

      if (!provider.request) {
        throw new Error('Provider does not support request method');
      }

      // Add timeout to the request
      const requestPromise = provider.request({ method: 'xcp_requestAccounts', params: [] });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000)
      );

      accounts = await Promise.race([requestPromise, timeoutPromise]);
      console.log('provider.request result:', accounts);
      
      console.log('Final result - accounts:', accounts);
      console.log('Type of accounts:', typeof accounts);
      console.log('Is accounts an array?', Array.isArray(accounts));
      console.log('Accounts length:', accounts?.length);
      
      // Also log the raw result to see the exact structure
      console.log('Raw accounts object:', JSON.stringify(accounts, null, 2));
      
      if (accounts && Array.isArray(accounts) && accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        console.log('Connected with account:', accounts[0]);
      } else {
        setError('No accounts returned from wallet. Please ensure your wallet is unlocked.');
        console.error('No accounts returned, received:', accounts);
      }
    } catch (err: any) {
      // Parse error message for specific error codes
      const errorMessage = err.message || 'Failed to connect wallet';
      
      if (errorMessage.includes('WALLET_NOT_SETUP') || errorMessage.includes('wallet setup')) {
        setError('Please complete wallet setup first. Open the XCP Wallet extension to get started.');
      } else if (errorMessage.includes('WALLET_LOCKED') || errorMessage.includes('Wallet is locked')) {
        setError('Wallet is locked. Click the XCP Wallet extension icon to unlock it.');
      } else if (errorMessage.includes('NO_ACTIVE_ADDRESS')) {
        setError('No address selected. Please select an address in your wallet.');
      } else if (errorMessage.includes('NO_ACTIVE_WALLET')) {
        setError('No wallet selected. Please select a wallet.');
      } else if (errorMessage.includes('User denied')) {
        setError('Connection request was rejected.');
      } else {
        setError(errorMessage);
      }
      
      console.error('Connection error:', err);
    } finally {
      setConnecting(false);
      connectingRef.current = false;
    }
  }, [getProvider]);

  // Disconnect from wallet
  const disconnect = useCallback(async () => {
    const provider = getProvider();

    // Call the wallet's disconnect method
    if (provider?.request) {
      try {
        await provider.request({ method: 'xcp_disconnect', params: [] });
      } catch (err) {
        console.error('Failed to disconnect from wallet:', err);
      }
    }

    // Clear local state
    setAccount(null);
    setIsConnected(false);
    setError(null);
  }, [getProvider]);

  // Compose an order transaction
  // Flow: 1) Compose via Counterparty API, 2) Sign via wallet extension, 3) Broadcast via wallet extension
  const composeOrder = useCallback(async (params: {
    give_asset: string;
    give_quantity: number;
    get_asset: string;
    get_quantity: number;
    expiration?: number;
    sat_per_vbyte?: number;
    fee_rate?: number; // Alias for sat_per_vbyte
  }) => {
    const provider = getProvider();
    if (!provider || !provider.request) {
      throw new Error('XCP Wallet not connected');
    }

    if (!account) {
      throw new Error('No account connected');
    }

    // Support both sat_per_vbyte and fee_rate (alias)
    const feeRate = params.sat_per_vbyte || params.fee_rate || 10;

    try {
      console.log('Composing order transaction via Counterparty API…');

      // Step 1: Compose the transaction via Counterparty API
      const composeResult = await composeOrderTransaction({
        sourceAddress: account,
        give_asset: params.give_asset,
        give_quantity: params.give_quantity,
        get_asset: params.get_asset,
        get_quantity: params.get_quantity,
        expiration: params.expiration || 8064,
        sat_per_vbyte: feeRate,
      });

      console.log('Transaction composed:', {
        btc_fee: composeResult.btc_fee,
        params: composeResult.params,
      });

      // Step 2: Sign the transaction via wallet extension
      console.log('Requesting signature from wallet…');
      const signResult = await provider.request({
        method: 'xcp_signTransaction',
        params: [{ hex: composeResult.rawtransaction }]
      }) as { hex: string };

      if (!signResult?.hex) {
        throw new Error('Failed to sign transaction');
      }

      console.log('Transaction signed, broadcasting…');

      // Step 3: Broadcast the signed transaction via wallet extension
      const broadcastResult = await provider.request({
        method: 'xcp_broadcastTransaction',
        params: [signResult.hex]
      }) as { txid: string };

      console.log('Order broadcast successfully:', broadcastResult);
      return { txid: broadcastResult.txid };
    } catch (err: any) {
      console.error('Compose order error:', err);

      // Handle specific error cases
      if (err.message?.includes('User cancelled') || err.message?.includes('User rejected')) {
        throw new Error('Order was cancelled by user');
      } else if (err.message?.includes('Popup required')) {
        throw new Error('Please approve the transaction in the wallet popup');
      } else if (err.message?.includes('Unauthorized')) {
        throw new Error('Wallet not connected. Please connect first.');
      }

      throw err;
    }
  }, [getProvider, account]);

  // Sign and broadcast a raw transaction via the wallet extension
  const signAndBroadcast = useCallback(async (rawTransaction: string): Promise<{ txid: string }> => {
    const provider = getProvider();
    if (!provider || !provider.request) {
      throw new Error('XCP Wallet not connected');
    }

    try {
      // Sign the transaction
      const signResult = await provider.request({
        method: 'xcp_signTransaction',
        params: [{ hex: rawTransaction }]
      }) as { hex: string };

      if (!signResult?.hex) {
        throw new Error('Failed to sign transaction');
      }

      // Broadcast the signed transaction
      const broadcastResult = await provider.request({
        method: 'xcp_broadcastTransaction',
        params: [signResult.hex]
      }) as { txid: string };

      return { txid: broadcastResult.txid };
    } catch (err: any) {
      console.error('Sign and broadcast error:', err);

      if (err.message?.includes('User cancelled') || err.message?.includes('User rejected')) {
        throw new Error('Transaction was cancelled by user');
      }

      throw err;
    }
  }, [getProvider]);

  return (
    <>
      <Web3Context.Provider value={{
        provider: getProvider(),
        isConnected,
        account,
        connecting,
        error,
        connect,
        disconnect,
        composeOrder,
        signAndBroadcast
      }}>
        {children}
      </Web3Context.Provider>
      
      <InstallWalletModal 
        isOpen={showInstallModal} 
        onClose={() => setShowInstallModal(false)} 
      />
    </>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}