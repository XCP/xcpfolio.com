'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders?limit=100');
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.orders);
        setError(null);
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
    const date = new Date(timestamp);
    const now = Date.now();
    const diff = now - timestamp;

    // If less than 1 hour ago, show relative time
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return 'Just now';
      return `${minutes}m ago`;
    }

    // If today, show time
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      });
    }

    // Otherwise show date
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (order: Order) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    
    switch (order.status) {
      case 'confirmed':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Delivered ✓</span>;
      case 'confirming':
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
            Confirming<span className="inline-block animate-pulse">...</span>
          </span>
        );
      case 'broadcasting':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Broadcasting...</span>;
      case 'processing':
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            Processing{order.retryCount ? ` (${order.retryCount})` : ''}
          </span>
        );
      case 'pending':
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Pending</span>;
      case 'permanently_failed':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Failed (Permanent)</span>;
      case 'failed':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Failed</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{order.status}</span>;
    }
  };

  const getDeliveryTime = (order: Order) => {
    if (!order.deliveredAt) {
      if (order.status === 'failed' || order.status === 'permanently_failed') return 'N/A';
      if (order.status === 'confirming' && order.confirmations !== undefined) {
        return `${order.confirmations}/1 confirmations`;
      }
      return 'Pending...';
    }
    
    const seconds = Math.floor((order.deliveredAt - order.purchasedAt) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Order Status</h1>
        <p className="text-gray-600">
          Track your XCPFOLIO asset purchases and delivery status
        </p>
        
        <div className="mt-4 flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">Auto-refresh every 10s</span>
          </label>
          
          <button
            onClick={fetchOrders}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Refresh Now
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No orders found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price (XCP)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Buyer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purchased
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.orderHash} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {order.asset}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {typeof order.price === 'string' ? order.price : order.price.toFixed(8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a
                      href={`https://xchain.io/address/${order.buyer}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {formatAddress(order.buyer)}
                    </a>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getDeliveryTime(order)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {order.txid ? (
                      <a
                        href={`https://mempool.space/tx/${order.txid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View TX →
                      </a>
                    ) : order.error ? (
                      <span className="text-red-600 text-xs" title={order.error}>
                        ⚠️ Error
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
      )}

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Understanding Order Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Pending:</span> Order detected, waiting to process
          </div>
          <div>
            <span className="font-medium">Processing:</span> Creating transfer transaction
          </div>
          <div>
            <span className="font-medium">Broadcasting:</span> Transaction sent to Bitcoin network
          </div>
          <div>
            <span className="font-medium">Confirming:</span> In mempool, waiting for confirmation
          </div>
          <div>
            <span className="font-medium">Delivered:</span> Asset successfully transferred
          </div>
        </div>
        
        <p className="mt-4 text-xs text-gray-500">
          Average delivery time is typically under 2 minutes. During high network congestion, 
          deliveries may take longer. Transactions are automatically retried if they get stuck.
        </p>
      </div>
    </div>
  );
}