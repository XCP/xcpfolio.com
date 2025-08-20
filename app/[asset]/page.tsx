'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAssetOrders, getDetailedAsset, getAssetOrderHistory, getAssetIssuances, getAssetOrderMatches, formatPrice, formatAge, formatRegistrationDate, getAssetMetadata, type Order, type DetailedAsset, type Issuance } from '@/lib/api';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useWeb3 } from '@/contexts/Web3Context';
import { trackEvent } from 'fathom-client';

export default function AssetPage() {
  const params = useParams();
  const asset = params.asset as string;
  const { isConnected, account, connect, composeOrder, signAndBroadcast } = useWeb3();
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  // Use React Query for caching orders
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', asset],
    queryFn: () => getAssetOrders(asset),
    enabled: !!asset,
    // Cache for 1 minute (orders change more frequently)
    staleTime: 60 * 1000,
    // Keep in cache for 5 minutes
    gcTime: 5 * 60 * 1000,
  });

  // Get metadata for this asset
  const { data: metadataInfo } = useQuery({
    queryKey: ['metadata'],
    queryFn: () => getAssetMetadata(false),
    staleTime: 60 * 60 * 1000,
  });

  const metadata = metadataInfo?.metadata?.[asset];

  // Get detailed asset information for the PARENT asset (not the subasset)
  const { data: detailedAsset } = useQuery({
    queryKey: ['detailedAsset', asset],
    queryFn: async () => {
      const result = await getDetailedAsset(asset); // asset is already the parent (e.g., "BACH")
      console.log('Asset owner:', result?.owner);
      return result;
    },
    enabled: !!asset,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get order matches to check if this XCPFOLIO asset has been sold
  const { data: orderMatches = [] } = useQuery({
    queryKey: ['orderMatches', asset],
    queryFn: () => getAssetOrderMatches(asset),
    enabled: !!asset,
    staleTime: 60 * 1000, // 1 minute
  });

  const isSold = orderMatches.length > 0;
  const isNumeric = metadata?.category === 'Numeric' || /^\d+$/.test(asset);

  // Get order history (all orders, not just open)
  const { data: orderHistory = [] } = useQuery({
    queryKey: ['orderHistory', asset],
    queryFn: () => getAssetOrderHistory(asset),
    enabled: !!asset,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Get issuance history for the parent asset (not subasset)
  const { data: issuances = [] } = useQuery({
    queryKey: ['issuances', asset],
    queryFn: () => getAssetIssuances(asset), // asset is already the parent (e.g., "BACH")
    enabled: !!asset,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleBuy = async (order?: Order) => {
    // Track purchase button click
    trackEvent('purchase_clicked', {
      _value: order ? order.get_quantity : 0
    });
    
    // If not connected, trigger wallet connection
    if (!isConnected) {
      await connect();
      return;
    }
    
    // If we don't have an account after connection, bail out
    if (!account) {
      setOrderError('Please connect your wallet to continue');
      return;
    }
    
    // If no order is available, show error
    if (!order) {
      setOrderError('No order available for this asset');
      return;
    }
    
    setIsCreatingOrder(true);
    setOrderError(null);
    setOrderSuccess(null);
    
    try {
      // Create a buy order that matches the sell order
      // To buy 1 XCPFOLIO.{asset}, we need to give the amount the seller is asking
      const orderParams = {
        give_asset: order.get_asset, // What seller wants (e.g., XCP)
        give_quantity: order.get_quantity, // Amount seller wants
        get_asset: order.give_asset, // What we want (XCPFOLIO.{asset})
        get_quantity: order.give_quantity, // Amount we want (1)
        expiration: 100, // blocks until expiration
        fee_rate: 20 // Higher fee rate for faster confirmation
      };
      
      console.log('Creating buy order with params:', orderParams);
      
      // Compose the order transaction
      const composedTx = await composeOrder(orderParams);
      console.log('Composed transaction:', composedTx);
      
      // Sign and broadcast the transaction
      // The compose result might be the raw transaction directly or wrapped in an object
      const rawTx = typeof composedTx === 'string' ? composedTx : (composedTx.rawtransaction || composedTx.raw_transaction || composedTx);
      const result = await signAndBroadcast(rawTx);
      console.log('Transaction broadcast result:', result);
      
      setOrderSuccess(`Order created successfully! Transaction: ${result.txid}`);
      
      // Show success message for a few seconds
      setTimeout(() => {
        setOrderSuccess(null);
      }, 10000);
      
    } catch (error: any) {
      console.error('Purchase error:', error);
      
      // Handle specific error cases
      if (error.message?.includes('User denied') || error.message?.includes('rejected')) {
        setOrderError('Transaction was rejected');
      } else if (error.message?.includes('WALLET_LOCKED')) {
        setOrderError('Please unlock your wallet and try again');
      } else if (error.message?.includes('insufficient')) {
        setOrderError('Insufficient balance to complete this purchase');
      } else if (error.message?.includes('timeout')) {
        setOrderError('Transaction timed out. Please try again');
      } else if (error.message?.includes('Rate limit')) {
        setOrderError('Too many requests. Please wait a moment and try again');
      } else {
        setOrderError(`Purchase failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleCreateBuyOrder = async () => {
    if (!isConnected || !account) {
      setOrderError('Please connect your wallet first');
      return;
    }

    setIsCreatingOrder(true);
    setOrderError(null);
    setOrderSuccess(null);

    try {
      // Create an order to buy 1 XCPFOLIO.{asset} for 10 XCP
      const orderParams = {
        give_asset: 'XCP',
        give_quantity: 1000000000, // 10 XCP in satoshis
        get_asset: `XCPFOLIO.${asset}`,
        get_quantity: 1, // 1 unit of the subasset
        expiration: 1000, // blocks until expiration
        fee_required: 0
      };

      const composedTx = await composeOrder(orderParams);
      const txHash = await signAndBroadcast(composedTx);
      
      setOrderSuccess(`Buy order created! Transaction: ${txHash}`);
    } catch (error) {
      setOrderError(`Failed to create order: ${error}`);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const hasOrders = orders.length > 0;
  
  // Use first order if available
  const displayOrder = orders[0] || { get_quantity: 1000000000, get_asset: 'XCP', source: 'XCPFOLIO' };

  return (
    <>
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />

      {/* Compact Hero with Side-by-Side Layout */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="grid lg:grid-cols-3 gap-0">
              {/* Left Side - Asset Info (2 cols) */}
              <div className="lg:col-span-2 p-8 lg:p-12">
                {/* Status */}
                <div className="mb-4">
                  {isSold ? (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 text-red-700 border border-red-200">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Sold
                    </span>
                  ) : !hasOrders ? (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-50 text-gray-600 border border-gray-200">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 000 2h1v1a1 1 0 102 0V9h1a1 1 0 100-2h-1V6a1 1 0 10-2 0v1H8z" clipRule="evenodd" />
                      </svg>
                      Not Listed
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Available
                    </span>
                  )}
                </div>

                {/* Asset Name */}
                <h1 className={`font-bold text-gray-900 mb-3 ${
                  isNumeric 
                    ? 'text-2xl sm:text-5xl' 
                    : asset.length >= 10 
                      ? 'text-4xl sm:text-6xl'
                      : asset.length >= 9
                        ? 'text-5xl sm:text-6xl'
                        : asset.length >= 7
                          ? 'text-6xl sm:text-7xl'
                          : 'text-7xl'
                }`}>
                  {asset}
                </h1>
                
                <p className="text-xl text-gray-600 mb-6">
                  Counterparty Asset Name<span className="hidden sm:inline"> Ownership</span>
                </p>

                {/* Quick Stats */}
                <div className="flex flex-wrap gap-3 mb-8">
                  {metadata && (
                    <>
                      <div className="bg-gray-50 rounded-lg px-4 py-2">
                        <span className="text-xs text-gray-500">Category</span>
                        <p className="font-semibold text-gray-900">{metadata.category}</p>
                      </div>
                      <div className="hidden sm:block bg-gray-50 rounded-lg px-4 py-2">
                        <span className="text-xs text-gray-500">Length</span>
                        <p className="font-semibold text-gray-900">{metadata.length} chars</p>
                      </div>
                      {metadata.first_issued && (
                        <div className="bg-gray-50 rounded-lg px-4 py-2">
                          <span className="text-xs text-gray-500">Age</span>
                          <p className="font-semibold text-gray-900">{formatAge(metadata.first_issued)}</p>
                        </div>
                      )}
                    </>
                  )}
                  {detailedAsset && (
                    <div className="hidden sm:block bg-gray-50 rounded-lg px-4 py-2">
                      <span className="text-xs text-gray-500">Status</span>
                      <p className="font-semibold text-gray-900 flex items-center gap-1">
                        {detailedAsset.locked ? (
                          <>
                            <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                            </svg>
                            Locked
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2h-2V7a3 3 0 00-3-3zm0 2a3 3 0 013 3v2H7V7a3 3 0 013-3z" />
                            </svg>
                            Unlocked
                          </>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                {/* Asset Features - Compact Version */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Permanent</p>
                      <p className="text-xs text-gray-500">No renewal fees</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Instant</p>
                      <p className="text-xs text-gray-500">Quick transfer</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Flexible</p>
                      <p className="text-xs text-gray-500">Multiple uses</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Secured</p>
                      <p className="text-xs text-gray-500">On blockchain</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Purchase Card (1 col) */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 lg:p-12 border-l border-gray-200 flex flex-col">
                {(hasOrders && !isSold) && (
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Buy This Asset</h3>
                    <Image 
                      src="/XCP.png" 
                      alt="XCP" 
                      width={24} 
                      height={24}
                      className="w-6 h-6"
                    />
                  </div>
                )}
                
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-full">
                {(hasOrders && !isSold) ? (
                  <>
                    <div className="mb-6">
                      <p className="text-sm text-gray-600 mb-2">Price</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">
                          {formatPrice(displayOrder.get_quantity)}
                        </span>
                        <span className="text-lg text-gray-600">{displayOrder.get_asset}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleBuy(orders[0] || undefined)}
                      disabled={isCreatingOrder}
                      className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-lg shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreatingOrder ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Creating Order...
                        </span>
                      ) : (
                        'Purchase'
                      )}
                    </button>
                    
                    {/* Error Message */}
                    {orderError && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">{orderError}</p>
                      </div>
                    )}
                    
                    {/* Success Message */}
                    {orderSuccess && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700">{orderSuccess}</p>
                      </div>
                    )}
                    
                    {orders[0]?.tx_hash && (
                      <div className="mt-6 pt-6 border-t border-gray-300">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Order</span>
                          <a 
                            href={`https://xcp.io/tx/${orders[0].tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                          >
                            {orders[0].tx_hash.slice(0, 8)}...
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-yellow-600 mt-4 bg-yellow-50 p-2 rounded text-center">
                      Estimated Delivery: 2-3 blocks after order confirms
                    </p>
                  </>
                ) : isSold ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <p className="text-gray-600 mb-4">Already sold</p>
                    {orderMatches.length > 0 && (
                      <a
                        href={`https://xcp.io/tx/${orderMatches[0].tx0_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        View Order Match
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-600 mb-4">No Active Listing</p>
                    <a
                      href={`mailto:dan@droplister.com?subject=XCPFOLIO.${asset}`}
                      className="inline-flex items-center px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                      onClick={() => trackEvent('inquire_clicked')}
                    >
                      Inquire Here
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </a>
                  </div>
                )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Streamlined */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How XCPFOLIO Works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <span className="text-lg font-bold text-blue-600">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Select Asset</h3>
                <p className="text-sm text-gray-600">Choose from available names</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <span className="text-lg font-bold text-blue-600">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Purchase Subasset</h3>
                <p className="text-sm text-gray-600">Buy 1 XCPFOLIO.{asset}</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <span className="text-lg font-bold text-blue-600">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Receive Ownership</h3>
                <p className="text-sm text-gray-600">Asset transfers to your address</p>
              </div>
            </div>
            <div className="text-center mt-6">
              <Link href="/how-it-works" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Learn more about it →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Asset Information Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column - Purchase & Asset Info */}
                  <div className="lg:col-span-2">
                    {/* Purchase Details - Only show when available */}
                    {(hasOrders && !isSold) && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Details</h3>
                        <dl className="space-y-3">
                          <div className="flex justify-between py-3 border-b">
                            <dt className="text-gray-600">To Receive</dt>
                            <dd className="font-medium">{asset} Ownership</dd>
                          </div>
                          <div className="flex justify-between py-3 border-b">
                            <dt className="text-gray-600">Purchase</dt>
                            <dd className="font-medium">
                              1 XCPFOLIO.{asset}
                            </dd>
                          </div>
                        </dl>
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => handleBuy(orders[0] || undefined)}
                            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                          >
                            Buy {formatPrice(displayOrder.get_quantity)} {displayOrder.get_asset}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Asset Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Information</h3>
                      <dl className="space-y-3">
                        {detailedAsset && (
                          <>
                            <div className="flex justify-between py-3 border-b">
                              <dt className="text-gray-600">Original Issuer</dt>
                              <dd className="font-mono text-sm sm:text-sm">
                                <span className="sm:hidden">
                                  {detailedAsset.issuer ? `${detailedAsset.issuer.slice(0, 6)}...${detailedAsset.issuer.slice(-6)}` : ''}
                                </span>
                                <span className="hidden sm:inline truncate max-w-xs">
                                  {detailedAsset.issuer}
                                </span>
                              </dd>
                            </div>
                            <div className="flex justify-between py-3 border-b">
                              <dt className="text-gray-600">Current Owner</dt>
                              <dd className="font-mono text-sm sm:text-sm flex items-center gap-1">
                                {detailedAsset.owner === '1BotpWeW4cWRZ26rLvBCRHTeWtaH5fUYPX' && (
                                  <span className="text-base">🤖</span>
                                )}
                                <span className="sm:hidden">
                                  {detailedAsset.owner ? `${detailedAsset.owner.slice(0, 6)}...${detailedAsset.owner.slice(-6)}` : ''}
                                </span>
                                <span className="hidden sm:inline truncate max-w-xs">
                                  {detailedAsset.owner}
                                </span>
                              </dd>
                            </div>
                            <div className="flex justify-between py-3 border-b">
                              <dt className="text-gray-600">First Issuance</dt>
                              <dd className="font-medium">
                                {detailedAsset.first_issuance_block_time 
                                  ? (() => {
                                      const date = new Date(detailedAsset.first_issuance_block_time * 1000);
                                      const dateStr = date.toISOString().split('T')[0];
                                      const age = formatAge(detailedAsset.first_issuance_block_time);
                                      const ageText = age.replace(' old', ' ago');
                                      return `${dateStr} (${ageText})`;
                                    })()
                                  : 'N/A'}
                              </dd>
                            </div>
                            <div className="flex justify-between py-3 border-b">
                              <dt className="text-gray-600">Supply Issued</dt>
                              <dd className="font-medium">{detailedAsset.supply_normalized || '0'}</dd>
                            </div>
                            <div className="flex justify-between py-3 border-b">
                              <dt className="text-gray-600">Lock Status</dt>
                              <dd>
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                  detailedAsset.locked 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {detailedAsset.locked ? (
                                    <>
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                      </svg>
                                      Locked
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2h-2V7a3 3 0 00-3-3zm0 2a3 3 0 013 3v2H7V7a3 3 0 013-3z" />
                                      </svg>
                                      Unlocked
                                    </>
                                  )}
                                </span>
                              </dd>
                            </div>
                            <div className="flex justify-between py-3 border-b">
                              <dt className="text-gray-600">Divisible?</dt>
                              <dd className="font-medium">{detailedAsset.divisible ? 'Yes' : 'No'}</dd>
                            </div>
                            {metadata?.category && (
                              <div className="flex justify-between py-3 border-b">
                                <dt className="text-gray-600">Category</dt>
                                <dd className="font-medium">{metadata.category}</dd>
                              </div>
                            )}
                            {metadata?.length && (
                              <div className="flex justify-between py-3 border-b">
                                <dt className="text-gray-600">Name Length</dt>
                                <dd className="font-medium">{metadata.length} characters</dd>
                              </div>
                            )}
                          </>
                        )}
                      </dl>
                    </div>
                  </div>

                  {/* Right Column - Issuance History */}
                  <div className="lg:col-span-1">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Issuance History</h3>
                      {issuances.length > 0 ? (
                        <div className="space-y-4">
                          {[...issuances].reverse().map((issuance, idx) => {
                            const isOldest = idx === 0;
                            const isTransfer = issuance.transfer;
                            const actionType = isOldest ? "Issuance" : 
                                             isTransfer ? "Transfer" : 
                                             "Updated";
                            const date = new Date(issuance.block_time * 1000).toISOString().split('T')[0];
                            
                            // Format addresses (show first 6 and last 6 characters)
                            const formatAddress = (addr: string) => 
                              addr ? `${addr.slice(0, 6)}...${addr.slice(-6)}` : '';
                            
                            const sourceFormatted = formatAddress(issuance.source);
                            const issuerFormatted = formatAddress(issuance.issuer);
                            
                            return (
                              <div key={idx} className="pb-3 border-b border-gray-200 last:border-0">
                                <div className="space-y-1">
                                  <div className="flex justify-between items-start">
                                    <p className="text-xs font-medium text-gray-900">
                                      Block {issuance.block_index}
                                    </p>
                                    <p className="text-xs text-gray-500">{date}</p>
                                  </div>
                                  <p className="text-xs font-medium text-gray-700">{actionType}</p>
                                  <p className="text-xs text-gray-600 font-mono">
                                    {isTransfer && issuance.source !== issuance.issuer ? (
                                      <span>{sourceFormatted} → {issuerFormatted}</span>
                                    ) : (
                                      <span>{issuerFormatted}</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No issuances recorded</p>
                      )}
                    </div>
                  </div>
                </div>
          </div>
        </div>
      </section>

      {/* Your Asset Comes Ready To Build */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Your Asset Comes Ready To Build
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Unlocked & Flexible</p>
                    <p className="text-sm text-gray-600">Full control to issue tokens and modify settings</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Zero Supply Issued</p>
                    <p className="text-sm text-gray-600">Start fresh with your own token economics</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Blank Description</p>
                    <p className="text-sm text-gray-600">Write your own story and branding</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Divisible by Default</p>
                    <p className="text-sm text-gray-600">Can be changed to indivisible for NFTs</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white/70 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Complete Control & Ownership</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    When you purchase {asset}, you receive complete control of the asset name on the Counterparty protocol. 
                    This is not a lease or subscription—it's permanent ownership on the Bitcoin blockchain.
                  </p>
                  <p className="text-sm text-gray-600">
                    Assets come "ready to build"—unlocked, with zero supply, and a blank canvas for you to create 
                    whatever you envision.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Can Build Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">What You Can Build with {asset}</h3>
            <div className="grid md:grid-cols-2 gap-6">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Fungible Tokens</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Create your own cryptocurrency or utility token with custom supply and divisibility settings.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">NFT Collections</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Issue unique digital art, collectibles, or certificates with individual token IDs.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Gaming Assets</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Build in-game currencies, items, and rewards that players truly own.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Brand Identity</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Establish your project\'s unique namespace on the blockchain forever.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Proof of Authenticity</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Issue verifiable certificates, licenses, or proof of ownership for real-world assets.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Community Tokens</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Create membership tokens, governance rights, or reward systems for your community.
                        </p>
                      </div>
                    </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* FAQ 1 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                How quickly will I receive ownership after purchase?
              </h3>
              <p className="text-gray-600 text-sm">
                After your DEX order confirms on the blockchain, we wait 1 block for security, then initiate the ownership 
                transfer which takes 2-3 additional blocks. Total time: approximately 30-40 minutes after your initial 
                purchase transaction.
              </p>
            </div>

            {/* FAQ 2 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Will the asset be reset or have any prior history?
              </h3>
              <p className="text-gray-600 text-sm">
                All assets come in a "blank canvas" state: unlocked, with zero supply issued, no description, 
                and set to divisible by default. You have complete freedom to configure the asset however you want.
              </p>
            </div>

            {/* FAQ 3 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Can I resell the asset after buying it?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes! Once you own the asset, you have complete control. You can transfer ownership to another address, 
                create your own marketplace, or hold it as a digital collectible. The asset is yours permanently unless 
                you choose to transfer it.
              </p>
            </div>

            {/* FAQ 4 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                What exactly am I buying?
              </h3>
              <p className="text-gray-600 text-sm">
                You're purchasing full ownership of the Counterparty asset name "{asset}". This gives you the exclusive 
                right to issue tokens, create subassets, set descriptions, and control all aspects of this asset on the 
                Counterparty protocol.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* You Might Also Like - Enhanced */}
      <section className="pt-8 pb-18 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Explore Similar Assets</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              href={`/?category=${metadata?.category}`}
              className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{metadata?.category} Assets</h3>
              <p className="text-xs text-gray-600">Browse category</p>
            </Link>

            <Link 
              href={`/?length=${metadata?.length}`}
              className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-100 transition-colors">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{metadata?.length}-Char Names</h3>
              <p className="text-xs text-gray-600">Same length</p>
            </Link>

            <Link 
              href={`/?sort=oldToNew`}
              className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-100 transition-colors">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Well-Aged</h3>
              <p className="text-xs text-gray-600">Classic names</p>
            </Link>

            <Link 
              href="/"
              className="group bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-orange-100 transition-colors">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">All Assets</h3>
              <p className="text-xs text-gray-600">Full catalog</p>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Own Your Asset Name?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Browse our collection and find the perfect name for your project
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Available Names
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </main>
    <Footer />
    </>
  );
}