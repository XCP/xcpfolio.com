import { useQuery } from '@tanstack/react-query';

interface AssetStatus {
  asset: string;
  status: 'available' | 'sold' | 'not-listed';
}

interface StatusResponse {
  timestamp: number;
  total: number;
  sold: number;
  available: number;
  statuses: AssetStatus[];
}

export function useAssetStatuses() {
  const { data, isLoading, error } = useQuery<StatusResponse>({
    queryKey: ['asset-statuses-minimal'],
    queryFn: async () => {
      const response = await fetch('/data/status-minimal.json');
      if (!response.ok) throw new Error('Failed to fetch statuses');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  // Create a map for O(1) lookups
  const statusMap = new Map<string, 'available' | 'sold' | 'not-listed'>();
  
  if (data?.statuses) {
    data.statuses.forEach(item => {
      statusMap.set(item.asset, item.status);
    });
  }

  return {
    getStatus: (assetName: string): 'available' | 'sold' | 'not-listed' => {
      return statusMap.get(assetName) || 'not-listed';
    },
    soldCount: data?.sold || 0,
    totalCount: data?.total || 0,
    availableCount: data?.available || 0,
    isLoading,
    error,
    hasData: !!data,
  };
}