'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getEnrichedSubassets, getAssetMetadata, parseAssetName, formatAge, formatRegistrationDate, type EnrichedSubasset } from '@/lib/api';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAssetStatuses } from '@/hooks/useAssetStatuses';

export default function Home() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLength, setSelectedLength] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'age' | 'price' | 'length'>('length');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Apply URL parameters on mount and when they change
  useEffect(() => {
    const category = searchParams.get('category');
    const length = searchParams.get('length');
    const age = searchParams.get('age');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');

    if (category) {
      setSelectedCategory(category);
    }
    if (length) {
      setSelectedLength(length);
    }
    if (age === 'recent') {
      setSortBy('age');
    }
    if (search) {
      setSearchQuery(search);
    }
    if (sort && ['name', 'age', 'price', 'length'].includes(sort)) {
      setSortBy(sort as 'name' | 'age' | 'price' | 'length');
    }
  }, [searchParams]);

  // Fetch enriched subassets with metadata
  const { data: subassets = [], isLoading, refetch } = useQuery({
    queryKey: ['enrichedSubassets'],
    queryFn: getEnrichedSubassets,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch categories for filter
  const { data: metadataInfo, refetch: refetchMetadata } = useQuery({
    queryKey: ['metadata'],
    queryFn: () => getAssetMetadata(false),
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const categories = metadataInfo?.categories || [];

  // Fetch asset statuses in the background (non-blocking)
  const { getStatus, isLoading: statusesLoading } = useAssetStatuses();

  // Filter and sort assets based on all criteria
  const filteredAssets = useMemo(() => {
    const filtered = subassets.filter(asset => {
      const name = parseAssetName(asset.asset_longname || asset.asset);
      
      // Search filter
      if (searchQuery && !name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && asset.metadata?.category !== selectedCategory) {
        return false;
      }

      // Length filter
      if (selectedLength !== 'all') {
        const targetLength = parseInt(selectedLength);
        if (!isNaN(targetLength) && (!asset.metadata?.length || asset.metadata.length !== targetLength)) {
          return false;
        }
      }

      return true;
    });

    // Sort the filtered results
    return filtered.sort((a, b) => {
      if (sortBy === 'age') {
        // Sort by age (oldest first)
        const aTime = a.metadata?.first_issued || Infinity;
        const bTime = b.metadata?.first_issued || Infinity;
        return aTime - bTime;
      } else if (sortBy === 'price') {
        // Sort by price (highest first), then alphabetically
        const aPrice = a.metadata?.ask_price || 0;
        const bPrice = b.metadata?.ask_price || 0;
        if (aPrice !== bPrice) {
          return bPrice - aPrice;
        }
        // If prices are equal, sort alphabetically
        const aName = parseAssetName(a.asset_longname || a.asset);
        const bName = parseAssetName(b.asset_longname || b.asset);
        return aName.localeCompare(bName);
      } else if (sortBy === 'length') {
        // Sort by length (shortest first)
        const aName = parseAssetName(a.asset_longname || a.asset);
        const bName = parseAssetName(b.asset_longname || b.asset);
        const aLength = a.metadata?.length || aName.length;
        const bLength = b.metadata?.length || bName.length;
        if (aLength !== bLength) {
          return aLength - bLength;
        }
        // If same length, sort alphabetically
        return aName.localeCompare(bName);
      } else {
        // Sort by name (alphabetical)
        const aName = parseAssetName(a.asset_longname || a.asset);
        const bName = parseAssetName(b.asset_longname || b.asset);
        return aName.localeCompare(bName);
      }
    });
  }, [subassets, searchQuery, selectedCategory, selectedLength, sortBy]);

  return (
    <main className="min-h-screen bg-gray-50">
      <Header totalAssets={!isLoading && subassets.length > 0 ? subassets.length : undefined} />

      {/* Quick Info Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Buy Counterparty Asset Names</h3>
              <p className="text-sm text-gray-600">
                Purchase premium asset names with XCP. Simple pricing, fast transfers.
              </p>
            </div>
            <Link 
              href="/how-it-works"
              className="ml-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Learn More →
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search asset names..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors text-sm"
                    aria-label="Search asset names"
                  />
                  <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-10 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors text-sm font-medium"
                  aria-label="Filter by category"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Length Filter */}
              <div>
                <select
                  value={selectedLength}
                  onChange={(e) => setSelectedLength(e.target.value)}
                  className="w-full h-10 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors text-sm font-medium"
                  aria-label="Filter by name length"
                >
                  <option value="all">Any Length</option>
                  <option value="4">LLLL (4 chars)</option>
                </select>
              </div>
            </div>

            {/* Sort & View Mode */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 flex-1 md:flex-initial">
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'age' | 'price' | 'length')}
                  className="h-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors text-sm font-medium w-full md:w-auto"
                  aria-label="Sort assets by"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="age">Age (Old to New)</option>
                  <option value="price">Price (High to Low)</option>
                  <option value="length">Length (Short to Long)</option>
                </select>
              </div>
              
              {/* View Toggle - Hidden on mobile */}
              <div className="hidden md:flex bg-gray-100 rounded-lg p-1 h-10 flex-shrink-0" role="group" aria-label="View mode">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    viewMode === 'cards' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  aria-label="Card view"
                  aria-pressed={viewMode === 'cards'}
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    viewMode === 'table' 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  aria-label="Table view"
                  aria-pressed={viewMode === 'table'}
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Table
                </button>
              </div>
            </div>
          </div>

          {/* Active filters display */}
          {(selectedCategory !== 'all' || selectedLength !== 'all' || searchQuery) && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-gray-500 font-medium">Active filters:</span>
                {searchQuery && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    Search: {searchQuery}
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedLength !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                    LLLL
                    <button
                      onClick={() => setSelectedLength('all')}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedLength('all');
                }}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Asset Display */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {isLoading ? (
          <div className="text-center py-12" role="status" aria-live="polite">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" aria-hidden="true"></div>
            <p className="mt-4 text-gray-600">Loading assets...</p>
          </div>
        ) : viewMode === 'cards' ? (
          // Cards View
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {filteredAssets.map((asset) => {
              const name = parseAssetName(asset.asset_longname || asset.asset);
              const isNumeric = asset.metadata?.category === 'Numeric' || /^\d+$/.test(name);
              
              return (
                <Link
                  key={asset.asset}
                  href={`/${name}`}
                  className="group"
                  aria-label={`View ${name} asset details`}
                >
                  <div className="relative bg-white rounded-xl shadow-sm hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100 hover:border-blue-200">
                    {/* SOLD Badge Overlay - Show based on real status */}
                    {getStatus(name) === 'sold' && (
                      <div className="absolute -top-3 left-2 z-10">
                        <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md border-2 border-white" aria-label="Sold">
                          SOLD
                        </div>
                      </div>
                    )}
                    
                    <div className="p-5 pb-3">
                      {/* Asset Name with responsive sizing */}
                      <h3 className={`font-bold text-center text-gray-900 pt-3 pb-4 transition-colors group-hover:text-blue-600 truncate ${
                        isNumeric 
                          ? 'text-sm' 
                          : name.length >= 10 
                            ? 'text-xl md:text-2xl'  // 10+ chars: xl on mobile, 2xl on desktop
                            : name.length >= 8 
                              ? 'text-2xl md:text-3xl'  // 8-9 chars: 2xl on mobile, 3xl on desktop  
                              : 'text-3xl'  // <8 chars: 3xl on all screens
                      }`}>
                        {name}
                      </h3>
                      
                      {/* Price Display */}
                      {asset.metadata?.ask_price ? (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 mb-2">
                          <div className="text-center">
                            <span className="text-xs text-gray-600 block">Buy Now</span>
                            <span className="text-base font-bold text-green-700">
                              {asset.metadata.ask_price} XCP
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-3 mb-2">
                          <div className="text-center">
                            <span className="text-sm text-gray-500">Make Offer</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Footer with HR */}
                    <div>
                      <hr className="border-gray-200" />
                      <div className="px-5 py-3 flex justify-between items-center text-xs">
                        <span className="text-gray-500 font-medium">
                          {asset.metadata?.category || 'Uncategorized'}
                        </span>
                        <span className="text-gray-400">
                          {asset.metadata?.first_issued ? formatAge(asset.metadata.first_issued) : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          // Table View
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asset Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      View
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssets.map((asset) => {
                    const name = parseAssetName(asset.asset_longname || asset.asset);
                    return (
                      <tr key={asset.asset} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link 
                            href={`/${name}`}
                            className="text-blue-600 hover:text-blue-900 font-semibold"
                            aria-label={`View ${name} asset`}
                          >
                            {name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {asset.metadata?.ask_price ? `${asset.metadata.ask_price} XCP` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {asset.metadata?.category || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {asset.metadata?.first_issued ? formatAge(asset.metadata.first_issued) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <Link 
                            href={`/${name}`}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer"
                            aria-label={`View status for ${name}`}
                          >
                            View Status
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!isLoading && filteredAssets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No assets found with current filters</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedLength('all');
              }}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
      
      <Footer />
    </main>
  );
}