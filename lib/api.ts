// API functions for interacting with Counterparty

const API_BASE = 'https://api.counterparty.io:4000';

// Compose order transaction result
export interface ComposeOrderResult {
  rawtransaction: string;
  psbt: string;
  btc_in: number;
  btc_out: number;
  btc_change: number;
  btc_fee: number;
  data: string;
  params: {
    source: string;
    give_asset: string;
    give_quantity: number;
    get_asset: string;
    get_quantity: number;
    expiration: number;
    fee_required: number;
  };
}

export interface Subasset {
  asset: string;
  asset_longname: string;
  owner: string;
  description?: string;
  divisible: boolean;
  locked: boolean;
  supply: number;
  confirmed?: boolean;
}

export interface AssetMetadata {
  asset: string;
  length: number;
  category: string;
  keyword: string;
  first_issued?: number;
  ask_price?: number;
}

export interface EnrichedSubasset extends Subasset {
  metadata?: AssetMetadata;
}

export interface DetailedAsset {
  asset: string;
  asset_id: string;
  asset_longname?: string;
  issuer: string;
  owner: string;
  divisible: boolean;
  locked: boolean;
  supply: number;
  description: string;
  first_issuance_block_index: number;
  last_issuance_block_index: number;
  confirmed: boolean;
  first_issuance_block_time: number;
  last_issuance_block_time: number;
  supply_normalized: string;
}

export interface Issuance {
  tx_index: number;
  tx_hash: string;
  msg_index: number;
  block_index: number;
  asset: string;
  quantity: number;
  divisible: boolean;
  source: string;
  issuer: string;
  transfer: boolean;
  callable: boolean;
  call_date: number;
  call_price: number;
  description: string;
  fee_paid: number;
  status: string;
  asset_longname?: string;
  locked: boolean;
  reset: boolean;
  description_locked: boolean;
  fair_minting: boolean;
  asset_events: string;
  confirmed: boolean;
  block_time: number;
  quantity_normalized: string;
  fee_paid_normalized: string;
}

export interface Order {
  tx_hash: string;
  source: string;
  give_asset: string;
  give_quantity: number;
  give_remaining: number;
  get_asset: string;
  get_quantity: number;
  get_remaining: number;
  status: string;
  give_price: number;
  expire_index?: number;
}

export interface OrderMatch {
  tx0_hash: string;
  tx1_hash: string;
  tx0_address: string;
  tx1_address: string;
  forward_asset: string;
  forward_quantity: number;
  backward_asset: string;
  backward_quantity: number;
  status: string;
  block_index?: number;
  confirmed?: boolean;
}

// Get all XCPFOLIO subassets with caching
export async function getSubassets(): Promise<Subasset[]> {
  try {
    const response = await fetch(
      `${API_BASE}/v2/assets/XCPFOLIO/subassets?verbose=true&limit=1000`,
      {
        // Cache for 5 minutes on the server
        next: { revalidate: 300 },
        // Also use browser cache
        cache: 'force-cache'
      }
    );
    const data = await response.json();
    return data.result || [];
  } catch (error) {
    console.error('Error fetching subassets:', error);
    return [];
  }
}

// Get detailed asset information
export async function getDetailedAsset(asset: string): Promise<DetailedAsset | null> {
  try {
    // Fetch parent asset info directly (no XCPFOLIO prefix)
    const response = await fetch(
      `${API_BASE}/v2/assets/${asset}?verbose=true&show_unconfirmed=true`
    );
    const data = await response.json();
    return data.result || null;
  } catch (error) {
    console.error('Error fetching asset details:', error);
    return null;
  }
}

// Get orders for a specific asset (to check if it's for sale)
export async function getAssetOrders(asset: string): Promise<Order[]> {
  try {
    const fullAssetName = asset.includes('.') ? asset : `XCPFOLIO.${asset}`;
    
    // First get the asset info to find the numeric ID
    const assetInfoResponse = await fetch(`${API_BASE}/v2/assets/${fullAssetName}`);
    if (!assetInfoResponse.ok) {
      console.error('Asset not found:', fullAssetName);
      return [];
    }
    
    const assetInfo = await assetInfoResponse.json();
    const numericAssetId = assetInfo.result?.asset; // This will be like "A9354266626025749995"
    
    if (!numericAssetId) {
      console.error('No numeric ID found for:', fullAssetName);
      return [];
    }
    
    // Use the numeric ID to query orders
    const response = await fetch(
      `${API_BASE}/v2/assets/${numericAssetId}/orders?status=open&verbose=true`
    );
    const data = await response.json();
    return data.result || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

// Get all orders for a specific asset (including history)
export async function getAssetOrderHistory(asset: string): Promise<Order[]> {
  try {
    const fullAssetName = asset.includes('.') ? asset : `XCPFOLIO.${asset}`;
    
    // First get the asset info to find the numeric ID
    const assetInfoResponse = await fetch(`${API_BASE}/v2/assets/${fullAssetName}`);
    if (!assetInfoResponse.ok) {
      console.error('Asset not found:', fullAssetName);
      return [];
    }
    
    const assetInfo = await assetInfoResponse.json();
    const numericAssetId = assetInfo.result?.asset;
    
    if (!numericAssetId) {
      console.error('No numeric ID found for:', fullAssetName);
      return [];
    }
    
    // Use the numeric ID to query orders
    const response = await fetch(
      `${API_BASE}/v2/assets/${numericAssetId}/orders?status=all&verbose=true&limit=50&sort=tx_index:desc`
    );
    const data = await response.json();
    return data.result || [];
  } catch (error) {
    console.error('Error fetching order history:', error);
    return [];
  }
}

// Get issuance history for a specific asset
export async function getAssetIssuances(asset: string): Promise<Issuance[]> {
  try {
    // Fetch parent asset issuances directly (no XCPFOLIO prefix)
    const response = await fetch(
      `${API_BASE}/v2/assets/${asset}/issuances?verbose=true&show_unconfirmed=true&limit=50`
    );
    const data = await response.json();
    return data.result || [];
  } catch (error) {
    console.error('Error fetching issuances:', error);
    return [];
  }
}

// Get orders from our address (to see what we're selling)
export async function getAddressOrders(address: string): Promise<Order[]> {
  try {
    const response = await fetch(
      `${API_BASE}/v2/addresses/${address}/orders?status=open&verbose=true`
    );
    const data = await response.json();
    return data.result || [];
  } catch (error) {
    console.error('Error fetching address orders:', error);
    return [];
  }
}

// Get order matches for a specific asset to check if it's been sold
export async function getAssetOrderMatches(asset: string): Promise<OrderMatch[]> {
  try {
    const fullAssetName = asset.includes('.') ? asset : `XCPFOLIO.${asset}`;
    
    // First get the asset info to find the numeric ID
    const assetInfoResponse = await fetch(`${API_BASE}/v2/assets/${fullAssetName}`);
    if (!assetInfoResponse.ok) {
      console.error('Asset not found:', fullAssetName);
      return [];
    }
    
    const assetInfo = await assetInfoResponse.json();
    const numericAssetId = assetInfo.result?.asset;
    
    if (!numericAssetId) {
      console.error('No numeric ID found for:', fullAssetName);
      return [];
    }
    
    // Use the numeric ID to query matches
    const response = await fetch(
      `${API_BASE}/v2/assets/${numericAssetId}/matches?status=completed&verbose=true`
    );
    const data = await response.json();
    return data.result || [];
  } catch (error) {
    console.error('Error fetching order matches:', error);
    return [];
  }
}

// Parse asset name from XCPFOLIO.NAME format
export function parseAssetName(fullName: string): string {
  return fullName.replace('XCPFOLIO.', '');
}

// Format price for display
export function formatPrice(quantity: number, divisible: boolean = true): string {
  if (divisible) {
    return (quantity / 100000000).toFixed(8).replace(/\.?0+$/, '');
  }
  return quantity.toString();
}

// Get asset metadata from CSV
export async function getAssetMetadata(forceRefresh = false): Promise<{
  metadata: Record<string, AssetMetadata>;
  categories: string[];
}> {
  try {
    // Add timestamp to bust cache in development or when forcing refresh
    const params = new URLSearchParams();
    if (process.env.NODE_ENV === 'development') {
      params.set('t', Date.now().toString());
    }
    if (forceRefresh) {
      params.set('refresh', 'true');
    }
    const queryString = params.toString();
    const url = `/api/metadata${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      next: { revalidate: forceRefresh ? 0 : 3600 }, // No cache if force refresh
      cache: forceRefresh ? 'no-store' : undefined,
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return { metadata: {}, categories: [] };
  }
}

// Format age for display
export function formatAge(timestamp?: number): string {
  if (!timestamp) return '';
  
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const years = now.getFullYear() - date.getFullYear();
  const months = now.getMonth() - date.getMonth();
  
  if (years > 0) {
    if (years === 1) {
      return '1 year old';
    }
    return `${years} years old`;
  } else if (months > 0) {
    if (months === 1) {
      return '1 month old';
    }
    return `${months} months old`;
  } else {
    const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) {
      return 'Today';
    } else if (days === 1) {
      return '1 day old';
    }
    return `${days} days old`;
  }
}

// Format registration date
export function formatRegistrationDate(timestamp?: number): string {
  if (!timestamp) return '';
  
  const date = new Date(timestamp * 1000);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `Registered ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

// Enrich subassets with metadata
export async function getEnrichedSubassets(): Promise<EnrichedSubasset[]> {
  const [subassets, { metadata }] = await Promise.all([
    getSubassets(),
    getAssetMetadata()
  ]);

  return subassets.map(subasset => {
    const name = parseAssetName(subasset.asset_longname || subasset.asset);
    return {
      ...subasset,
      metadata: metadata[name]
    };
  });
}

// Compose an order transaction via the Counterparty API
// Returns the unsigned transaction for signing by the wallet
export async function composeOrderTransaction(params: {
  sourceAddress: string;
  give_asset: string;
  give_quantity: number;
  get_asset: string;
  get_quantity: number;
  expiration?: number;
  fee_required?: number;
  sat_per_vbyte?: number;
}): Promise<ComposeOrderResult> {
  const {
    sourceAddress,
    give_asset,
    give_quantity,
    get_asset,
    get_quantity,
    expiration = 8064, // ~8 weeks default
    fee_required = 0,
    sat_per_vbyte = 10,
  } = params;

  const queryParams = new URLSearchParams({
    give_asset,
    give_quantity: give_quantity.toString(),
    get_asset,
    get_quantity: get_quantity.toString(),
    expiration: expiration.toString(),
    fee_required: fee_required.toString(),
    sat_per_vbyte: sat_per_vbyte.toString(),
    exclude_utxos_with_balances: 'true',
    verbose: 'true',
  });

  const url = `${API_BASE}/v2/addresses/${sourceAddress}/compose/order?${queryParams.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to compose order: ${response.status}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.result;
}