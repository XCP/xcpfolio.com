'use client';

import { useState, useEffect } from 'react';
import { useWeb3 } from '@/contexts/Web3Context';

export default function TestPage() {
  const { provider, account, isConnected, connect, disconnect } = useWeb3();
  const [results, setResults] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<{ [key: string]: string }>({});

  // Test data
  const [testAddress, setTestAddress] = useState('');
  const [testAmount, setTestAmount] = useState('1000');
  const [testAsset, setTestAsset] = useState('XCP');
  const [testMessage, setTestMessage] = useState('Hello from XCP Wallet!');
  const [testTxHex, setTestTxHex] = useState('');

  useEffect(() => {
    if (account) {
      setTestAddress(account);
    }
  }, [account]);

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(prev => ({ ...prev, [testName]: true }));
    setError(prev => ({ ...prev, [testName]: '' }));
    
    try {
      const result = await testFn();
      setResults(prev => ({ ...prev, [testName]: result }));
    } catch (err: any) {
      setError(prev => ({ ...prev, [testName]: err.message || 'Unknown error' }));
      setResults(prev => ({ ...prev, [testName]: null }));
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }));
    }
  };

  // Test functions
  const testGetAccounts = () => runTest('getAccounts', async () => {
    if (!provider) throw new Error('Provider not available');
    return await provider.request({ method: 'xcp_accounts' });
  });

  const testRequestAccounts = () => runTest('requestAccounts', async () => {
    if (!provider) throw new Error('Provider not available');
    return await provider.request({ method: 'xcp_requestAccounts' });
  });

  const testGetChainId = () => runTest('getChainId', async () => {
    if (!provider) throw new Error('Provider not available');
    return await provider.request({ method: 'xcp_chainId' });
  });

  const testGetNetwork = () => runTest('getNetwork', async () => {
    if (!provider) throw new Error('Provider not available');
    return await provider.request({ method: 'xcp_getNetwork' });
  });

  const testGetBalances = () => runTest('getBalances', async () => {
    if (!provider) throw new Error('Provider not available');
    return await provider.request({ method: 'xcp_getBalances' });
  });

  const testGetHistory = () => runTest('getHistory', async () => {
    if (!provider) throw new Error('Provider not available');
    return await provider.request({ method: 'xcp_getHistory' });
  });

  const testComposeSend = () => runTest('composeSend', async () => {
    if (!provider) throw new Error('Provider not available');
    if (!account) throw new Error('No account connected');
    return await provider.request({ 
      method: 'xcp_composeSend',
      params: [{
        source: account,
        destination: testAddress || account, // Use same address if no destination
        asset: testAsset,
        quantity: testAmount
      }]
    });
  });

  const testComposeOrder = () => runTest('composeOrder', async () => {
    if (!provider) throw new Error('Provider not available');
    if (!account) throw new Error('No account connected');
    return await provider.request({ 
      method: 'xcp_composeOrder',
      params: [{
        source: account,
        give_asset: 'XCP',
        give_quantity: '1000000',
        get_asset: 'PEPECASH',
        get_quantity: '1000000000',
        expiration: 1000,
        fee_required: 0
      }]
    });
  });

  const testComposeIssuance = () => runTest('composeIssuance', async () => {
    if (!provider) throw new Error('Provider not available');
    if (!account) throw new Error('No account connected');
    return await provider.request({ 
      method: 'xcp_composeIssuance',
      params: [{
        source: account,
        asset: 'TESTASSET' + Date.now(),
        quantity: 1000000,
        divisible: true,
        description: 'Test asset from XCP Wallet'
      }]
    });
  });

  const testSignMessage = () => runTest('signMessage', async () => {
    if (!provider) throw new Error('Provider not available');
    if (!account) throw new Error('No account connected');
    return await provider.request({ 
      method: 'xcp_signMessage',
      params: [testMessage, account]
    });
  });

  const testSignTransaction = () => runTest('signTransaction', async () => {
    if (!provider) throw new Error('Provider not available');
    if (!testTxHex) throw new Error('Please enter a transaction hex');
    return await provider.request({ 
      method: 'xcp_signTransaction',
      params: [testTxHex]
    });
  });

  const testBroadcastTransaction = () => runTest('broadcastTransaction', async () => {
    if (!provider) throw new Error('Provider not available');
    const signedTx = results.signTransaction;
    if (!signedTx) throw new Error('Please sign a transaction first');
    return await provider.request({ 
      method: 'xcp_broadcastTransaction',
      params: [signedTx]
    });
  });

  const testDisconnect = () => runTest('disconnect', async () => {
    if (!provider) throw new Error('Provider not available');
    return await provider.request({ method: 'xcp_disconnect' });
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">XCP Wallet Test Page</h1>
            <p className="mt-1 text-sm text-gray-600">
              Test all available Web3 provider methods
            </p>
          </div>

          {/* Connection Status */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Status: {isConnected ? 'Connected' : 'Not Connected'}
                </p>
                {account && (
                  <p className="text-xs text-gray-600 mt-1">
                    Account: {account}
                  </p>
                )}
              </div>
              <button
                onClick={isConnected ? disconnect : connect}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                {isConnected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>

          {/* Test Inputs */}
          <div className="px-6 py-4 border-b border-gray-200 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Test Parameters</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Test Address
                </label>
                <input
                  type="text"
                  value={testAddress}
                  onChange={(e) => setTestAddress(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Bitcoin address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <input
                  type="text"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="1000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Asset
                </label>
                <input
                  type="text"
                  value={testAsset}
                  onChange={(e) => setTestAsset(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="XCP"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <input
                  type="text"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Message to sign"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Transaction Hex (for signing)
                </label>
                <textarea
                  value={testTxHex}
                  onChange={(e) => setTestTxHex(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  rows={3}
                  placeholder="Raw transaction hex"
                />
              </div>
            </div>
          </div>

          {/* Test Methods */}
          <div className="px-6 py-4 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Test Methods</h2>
            
            {/* Account Methods */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Account Methods</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <TestButton
                  name="xcp_accounts"
                  onClick={testGetAccounts}
                  loading={loading.getAccounts}
                  disabled={!provider}
                />
                <TestButton
                  name="xcp_requestAccounts"
                  onClick={testRequestAccounts}
                  loading={loading.requestAccounts}
                  disabled={!provider}
                />
                <TestButton
                  name="xcp_disconnect"
                  onClick={testDisconnect}
                  loading={loading.disconnect}
                  disabled={!isConnected}
                />
              </div>
            </div>

            {/* Network Methods */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Network Methods</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <TestButton
                  name="xcp_chainId"
                  onClick={testGetChainId}
                  loading={loading.getChainId}
                  disabled={!provider}
                />
                <TestButton
                  name="xcp_getNetwork"
                  onClick={testGetNetwork}
                  loading={loading.getNetwork}
                  disabled={!provider}
                />
              </div>
            </div>

            {/* Data Methods */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Data Methods</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <TestButton
                  name="xcp_getBalances"
                  onClick={testGetBalances}
                  loading={loading.getBalances}
                  disabled={!isConnected}
                />
                <TestButton
                  name="xcp_getHistory"
                  onClick={testGetHistory}
                  loading={loading.getHistory}
                  disabled={!isConnected}
                />
              </div>
            </div>

            {/* Transaction Methods */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Transaction Methods</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <TestButton
                  name="xcp_composeSend"
                  onClick={testComposeSend}
                  loading={loading.composeSend}
                  disabled={!isConnected}
                />
                <TestButton
                  name="xcp_composeOrder"
                  onClick={testComposeOrder}
                  loading={loading.composeOrder}
                  disabled={!isConnected}
                />
                <TestButton
                  name="xcp_composeIssuance"
                  onClick={testComposeIssuance}
                  loading={loading.composeIssuance}
                  disabled={!isConnected}
                />
              </div>
            </div>

            {/* Signing Methods */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-3">Signing Methods</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <TestButton
                  name="xcp_signMessage"
                  onClick={testSignMessage}
                  loading={loading.signMessage}
                  disabled={!isConnected}
                />
                <TestButton
                  name="xcp_signTransaction"
                  onClick={testSignTransaction}
                  loading={loading.signTransaction}
                  disabled={!isConnected || !testTxHex}
                />
                <TestButton
                  name="xcp_broadcastTransaction"
                  onClick={testBroadcastTransaction}
                  loading={loading.broadcastTransaction}
                  disabled={!isConnected || !results.signTransaction}
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="px-6 py-4 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Results</h2>
            <div className="space-y-4">
              {Object.entries(results).map(([key, value]) => (
                <ResultDisplay
                  key={key}
                  method={key}
                  result={value}
                  error={error[key]}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TestButton({ 
  name, 
  onClick, 
  loading, 
  disabled 
}: { 
  name: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        px-4 py-2 rounded-md text-sm font-medium transition-colors
        ${disabled 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
          : loading
          ? 'bg-blue-100 text-blue-700'
          : 'bg-blue-600 text-white hover:bg-blue-700'
        }
      `}
    >
      {loading ? 'Testing...' : name}
    </button>
  );
}

function ResultDisplay({ 
  method, 
  result, 
  error 
}: { 
  method: string;
  result: any;
  error?: string;
}) {
  if (!result && !error) return null;
  
  return (
    <div className="border rounded-lg p-4">
      <h4 className="font-medium text-gray-900 mb-2">{method}</h4>
      {error ? (
        <div className="text-red-600 text-sm">
          Error: {error}
        </div>
      ) : (
        <pre className="text-sm text-gray-700 overflow-x-auto bg-gray-50 p-2 rounded">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}