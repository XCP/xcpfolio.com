import { NextResponse } from 'next/server';

const MEMPOOL_API = 'https://mempool.space/api';

export async function GET() {
  try {
    // Fetch current block height from mempool.space
    const response = await fetch(`${MEMPOOL_API}/blocks/tip/height`, {
      next: { revalidate: 600 } // Cache for 10 minutes
    });

    if (!response.ok) {
      throw new Error('Failed to fetch block height');
    }

    const blockHeight = await response.json();

    return NextResponse.json({ 
      success: true,
      blockHeight 
    });
  } catch (error) {
    console.error('Error fetching block height:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch block height' 
      },
      { status: 500 }
    );
  }
}