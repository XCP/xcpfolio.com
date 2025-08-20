'use client';

import { useQueryClient } from '@tanstack/react-query';

export function CacheBuster() {
  const queryClient = useQueryClient();

  const clearAllCaches = async () => {
    // Clear React Query cache
    queryClient.clear();
    
    // Force refetch all queries
    await queryClient.invalidateQueries();
    
    // Clear sessionStorage and localStorage
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      localStorage.clear();
    }
    
    // Hard reload the page
    window.location.reload();
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <button
      onClick={clearAllCaches}
      className="fixed bottom-4 left-4 z-50 px-3 py-1.5 bg-gray-700 text-white text-xs font-medium rounded-md shadow-lg hover:bg-gray-800 transition-colors opacity-70 hover:opacity-100"
      title="Clear all caches and reload"
    >
      🔄 Clear Cache
    </button>
  );
}