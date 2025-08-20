'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { InstallWalletModal } from '@/components/InstallWalletModal';

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
    fee_rate?: number;
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
    const performInitialCheck = (provider: XCPWalletProvider) => {
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
          }
        } catch (err) {
          // Ignore errors on initial check
          console.log('Initial connection check failed:', err);
        }
      };
      
      checkConnection();

      // Set up event listeners using official XCP Wallet API
      if (typeof provider.on === 'function') {
        provider.on('accountsChanged', handleAccountsChanged);
        provider.on('disconnect', handleDisconnect);
      }

      return () => {
        if (typeof provider.removeListener === 'function') {
          provider.removeListener('accountsChanged', handleAccountsChanged);
          provider.removeListener('disconnect', handleDisconnect);
        }
      };
    };

    const checkInitialConnection = () => {
      const provider = getProvider();
      if (!provider) {
        console.log('No provider found after initialization');
        return;
      }
      
      console.log('Checking initial connection with provider:', provider);
      performInitialCheck(provider);
    };

    // Listen for wallet initialization
    const handleWalletInit = () => {
      console.log('XCP Wallet initialized event received');
      // Small delay to ensure provider is fully set up
      setTimeout(checkInitialConnection, 100);
    };

    // Listen for the wallet initialization event
    window.addEventListener('xcp-wallet#initialized', handleWalletInit);

    // Debug: Listen for all window messages to see wallet communication
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.target === 'xcp-wallet-injected') {
        console.log('Received XCP Wallet message:', event.data);
        
        // Check for the specific messaging conflict
        if (event.data.data?.message?.includes('Unknown message format')) {
          console.error('XCP Wallet extension conflict detected:', event.data.data.message);
          setError('Multiple XCP Wallet extensions detected. Please go to chrome://extensions/ and disable any other XCP/Counterparty wallet extensions, then refresh this page.');
        }
        
        console.log('Message data details:', {
          type: event.data.type,
          id: event.data.id,
          data: event.data.data,
          error: event.data.error,
          dataResult: event.data.data?.result,
          dataMethod: event.data.data?.method
        });
      }
    };
    window.addEventListener('message', handleMessage);

    const provider = getProvider();
    if (provider) {
      performInitialCheck(provider);
    } else {
      console.log('Provider not found on initial load, waiting for xcp-wallet#initialized event');
    }

    return () => {
      window.removeEventListener('xcp-wallet#initialized', handleWalletInit);
      window.removeEventListener('message', handleMessage);
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
      
      // Try both methods to see which one works
      console.log('Trying provider.request first...');
      
      let accounts = null;
      try {
        console.log('Current origin:', window.location.origin);
        console.log('Making request with timeout...');
        
        // Add timeout to the request
        const requestPromise = provider.request?.({ method: 'xcp_requestAccounts', params: [] });
        if (!requestPromise) {
          throw new Error('Provider request method not available');
        }
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000)
        );
        
        accounts = await Promise.race([requestPromise, timeoutPromise]);
        console.log('provider.request result:', accounts);
      } catch (requestErr) {
        console.log('provider.request failed:', requestErr);
        
        if (provider.enable) {
          console.log('Trying provider.enable as fallback...');
          try {
            accounts = await provider.enable();
            console.log('provider.enable result:', accounts);
          } catch (enableErr) {
            console.log('provider.enable failed:', enableErr);
          }
        }
      }
      
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
      
      if (errorMessage.includes('WALLET_NOT_SETUP')) {
        setError('Please complete wallet setup first. Open the XCP Wallet extension to get started.');
      } else if (errorMessage.includes('WALLET_LOCKED')) {
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

  // Disconnect (note: actual disconnection should be done from wallet)
  const disconnect = useCallback(() => {
    setAccount(null);
    setIsConnected(false);
    setError(null);
  }, []);

  // Compose an order transaction using official XCP Wallet API
  const composeOrder = useCallback(async (params: {
    give_asset: string;
    give_quantity: number;
    get_asset: string;
    get_quantity: number;
    expiration?: number;
    fee_rate?: number;
  }) => {
    const provider = getProvider();
    if (!provider || !provider.request) {
      throw new Error('XCP Wallet not connected');
    }

    try {
      const result = await provider.request({
        method: 'xcp_composeOrder',
        params: [{
          give_asset: params.give_asset,
          give_quantity: params.give_quantity.toString(),
          get_asset: params.get_asset,
          get_quantity: params.get_quantity.toString(),
          expiration: params.expiration || 1000,
          fee_rate: params.fee_rate || 10
        }]
      });
      return result;
    } catch (err: any) {
      console.error('Compose order error:', err);
      throw err;
    }
  }, [getProvider]);

  // Sign and broadcast a transaction using official XCP Wallet API
  const signAndBroadcast = useCallback(async (rawTransaction: string) => {
    const provider = getProvider();
    if (!provider || !provider.request) {
      throw new Error('XCP Wallet not connected');
    }

    try {
      // First sign the transaction
      const signResult = await provider.request({
        method: 'xcp_signTransaction',
        params: [rawTransaction]
      });

      // Then broadcast it
      const broadcastResult = await provider.request({
        method: 'xcp_broadcastTransaction',
        params: [signResult.signedTransaction]
      });

      return broadcastResult;
    } catch (err: any) {
      console.error('Sign and broadcast error:', err);
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