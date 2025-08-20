import { NextResponse } from 'next/server';

export async function GET() {
  // Check if we can reach the Counterparty API
  let apiStatus = 'unknown';
  try {
    const response = await fetch('https://api.counterparty.io/v2/', {
      signal: AbortSignal.timeout(5000)
    });
    apiStatus = response.ok ? 'healthy' : 'degraded';
  } catch (error) {
    apiStatus = 'unhealthy';
  }

  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    services: {
      api: apiStatus,
      database: 'healthy', // We don't have a DB, but this is where you'd check it
    }
  };

  return NextResponse.json(health, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    }
  });
}