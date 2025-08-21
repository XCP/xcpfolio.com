import { NextResponse } from 'next/server';

const BOT_API_URL = process.env.BOT_API_URL || 'http://localhost:3001';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '50';
    
    // Fetch from bot API
    const response = await fetch(`${BOT_API_URL}/api/orders?limit=${limit}`, {
      cache: 'no-store', // Always fetch fresh data
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Bot API responded with ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching orders:', error);
    
    // Return mock data if bot is not running (for development)
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        success: true,
        orders: getMockOrders(),
        total: 5,
        timestamp: Date.now()
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// Mock data for development
function getMockOrders() {
  return [
    {
      orderHash: '0x123...',
      asset: 'RAREPEPE',
      price: 0.5,
      buyer: '1ABC...xyz',
      status: 'confirmed',
      stage: 'confirmed',
      purchasedAt: Date.now() - 3600000,
      deliveredAt: Date.now() - 3500000,
      confirmedAt: Date.now() - 3400000,
      txid: '0xabc...'
    },
    {
      orderHash: '0x456...',
      asset: 'PEPENOPOULOS',
      price: 0.25,
      buyer: '1DEF...uvw',
      status: 'broadcasting',
      stage: 'mempool',
      purchasedAt: Date.now() - 1800000,
      deliveredAt: Date.now() - 1700000,
      txid: '0xdef...'
    },
    {
      orderHash: '0x789...',
      asset: 'DANKPEPE',
      price: 0.75,
      buyer: '1GHI...rst',
      status: 'processing',
      stage: 'compose',
      purchasedAt: Date.now() - 900000,
      retryCount: 2
    },
    {
      orderHash: '0xabc...',
      asset: 'FEELSGOODMAN',
      price: 1.0,
      buyer: '1JKL...opq',
      status: 'pending',
      stage: 'validation',
      purchasedAt: Date.now() - 300000
    },
    {
      orderHash: '0xdef...',
      asset: 'WOJAK',
      price: 0.33,
      buyer: '1MNO...lmn',
      status: 'failed',
      stage: 'validation',
      purchasedAt: Date.now() - 7200000,
      error: 'Asset not owned by seller'
    }
  ];
}