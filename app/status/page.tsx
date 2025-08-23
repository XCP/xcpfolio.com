'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

interface Order {
  orderHash: string;
  asset: string;
  price: number;
  buyer: string;
  status: 'pending' | 'processing' | 'broadcasting' | 'confirming' | 'confirmed' | 'failed' | 'permanently_failed';
  stage?: string;
  purchasedAt: number;
  purchasedBlock?: number;
  deliveredAt?: number;
  confirmedAt?: number;
  confirmedBlock?: number;
  confirmations?: number;
  txid?: string;
  error?: string;
  retryCount?: number;
}

export default function StatusPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [averageTTD, setAverageTTD] = useState<number | null>(null);
  const router = useRouter();
  
  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders?limit=100');
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders);
        setError(null);
        
        // Calculate average TTD for confirmed orders
        const confirmedOrdersWithBlocks = data.orders.filter(
          (order: Order) => order.status === 'confirmed' && 
          order.purchasedBlock && 
          order.confirmedBlock
        );
        
        if (confirmedOrdersWithBlocks.length > 0) {
          const totalTTD = confirmedOrdersWithBlocks.reduce(
            (sum: number, order: Order) => 
              sum + ((order.confirmedBlock || 0) - (order.purchasedBlock || 0)),
            0
          );
          setAverageTTD(totalTTD / confirmedOrdersWithBlocks.length);
        } else {
          setAverageTTD(null);
        }
      } else {
        setError(data.error || 'Failed to fetch orders');
      }
    } catch (err) {
      setError('Failed to connect to order service');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Auto-refresh every 10 seconds
    const interval = autoRefresh ? setInterval(fetchOrders, 10000) : null;
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const formatAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    // Always show relative time
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }
    const days = Math.floor(diff / 86400000);
    return `${days}d ago`;
  };

  const getStatusBadge = (order: Order) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (order.status) {
      case 'confirmed':
        return (
          <span className={`${baseClasses} bg-green-50 text-green-800 border border-green-200`}>
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Delivered
          </span>
        );
      case 'confirming':
        return (
          <span className={`${baseClasses} bg-blue-50 text-blue-800 border border-blue-200`}>
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-800 mr-1"></div>
            Confirming
          </span>
        );
      case 'broadcasting':
        return (
          <span className={`${baseClasses} bg-blue-50 text-blue-800 border border-blue-200`}>
            <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full mr-1.5"></div>
            Broadcasting
          </span>
        );
      case 'processing':
        return (
          <span className={`${baseClasses} bg-yellow-50 text-yellow-800 border border-yellow-200`}>
            Processing{order.retryCount ? ` (${order.retryCount})` : ''}
          </span>
        );
      case 'pending':
        return (
          <span className={`${baseClasses} bg-gray-50 text-gray-700 border border-gray-200`}>
            Pending
          </span>
        );
      case 'permanently_failed':
        return (
          <span className={`${baseClasses} bg-red-50 text-red-800 border border-red-200`}>
            Failed (Permanent)
          </span>
        );
      case 'failed':
        return (
          <span className={`${baseClasses} bg-red-50 text-red-800 border border-red-200`}>
            Failed
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-50 text-gray-700 border border-gray-200`}>
            {order.status}
          </span>
        );
    }
  };

  const getDeliveryInfo = (order: Order) => {
    // Only show delivery info for confirmed orders
    if (order.status === 'confirmed' && order.deliveredAt) {
      return (
        <div>
          {order.confirmedBlock ? (
            <>
              <div className="text-sm font-medium text-gray-900">
                Block {order.confirmedBlock.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">
                {formatTime(order.deliveredAt)}
              </div>
            </>
          ) : (
            <div className="text-sm text-gray-500">
              {formatTime(order.deliveredAt)}
            </div>
          )}
        </div>
      );
    }
    
    // Show nothing or spinner for non-delivered orders
    if (order.status === 'failed' || order.status === 'permanently_failed') {
      return <span className="text-gray-400">—</span>;
    }
    
    if (order.status === 'confirming' || order.status === 'broadcasting' || order.status === 'processing') {
      // Show a subtle spinner for in-progress orders
      return (
        <div className="flex justify-start">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    
    // For pending or any other status, show empty
    return <span className="text-gray-400">—</span>;
  };

  const getTTD = (order: Order) => {
    // Calculate TTD only for confirmed orders with both blocks
    if (order.status === 'confirmed' && order.purchasedBlock && order.confirmedBlock) {
      const ttd = order.confirmedBlock - order.purchasedBlock;
      return (
        <div className="text-sm">
          <span className="font-medium text-gray-900">{ttd}</span>
        </div>
      );
    }
    
    // Show dash for all non-delivered orders
    return <span className="text-gray-400">—</span>;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header showOrderStatus={false} showBackButton={true} onBack={handleGoBack} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading orders...</p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header showOrderStatus={false} showBackButton={true} onBack={handleGoBack} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Status</h1>
          <p className="text-gray-600 mb-4">
            Track your XCPFOLIO asset purchases and delivery status
          </p>
          
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Auto-refresh every 10s</span>
            </label>
            
            <button
              onClick={fetchOrders}
              className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Refresh Now
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="text-center py-12">
            <p className="text-gray-600">No orders found</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buyer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purchased
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivered
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TTD
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.orderHash} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      href={`/${order.asset}`}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                    >
                      {order.asset}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {typeof order.price === 'string' ? order.price : order.price.toFixed(8)} XCP
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-gray-600">
                      {formatAddress(order.buyer)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order)}
                    {order.stage && order.status === 'processing' && (
                      <span className="ml-1 text-xs text-gray-500">
                        ({order.stage})
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      {order.purchasedBlock ? (
                        <>
                          <div className="text-sm font-medium text-gray-900">
                            Block {order.purchasedBlock.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatTime(order.purchasedAt)}
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">
                          {formatTime(order.purchasedAt)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getDeliveryInfo(order)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {getTTD(order)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {order.txid ? (
                      <a
                        href={`https://mempool.space/tx/${order.txid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        View TX
                        <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : order.error ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-50 rounded" title={order.error}>
                        Error
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Status Guide */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Understanding Order Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></div>
            <div>
              <span className="font-medium text-gray-900">Pending:</span>
              <span className="text-sm text-gray-600 ml-1">Order detected, waiting to process</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-400 mt-1.5 flex-shrink-0"></div>
            <div>
              <span className="font-medium text-gray-900">Processing:</span>
              <span className="text-sm text-gray-600 ml-1">Creating transfer transaction</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
            <div>
              <span className="font-medium text-gray-900">Broadcasting:</span>
              <span className="text-sm text-gray-600 ml-1">Transaction sent to Bitcoin network</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
            <div>
              <span className="font-medium text-gray-900">Confirming:</span>
              <span className="text-sm text-gray-600 ml-1">In mempool, waiting for confirmation</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
            <div>
              <span className="font-medium text-gray-900">Delivered:</span>
              <span className="text-sm text-gray-600 ml-1">Asset successfully transferred</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 flex-shrink-0"></div>
            <div>
              <span className="font-medium text-gray-900">TTD:</span>
              <span className="text-sm text-gray-600 ml-1">Time To Delivery in blocks</span>
            </div>
          </div>
        </div>
        {averageTTD !== null && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-600">
                Average TTD: <span className="font-semibold text-gray-900">{averageTTD.toFixed(1)}</span> blocks after confirmation
              </p>
            </div>
          </div>
        )}
      </div>
      </div>
      <Footer />
    </main>
  );
}