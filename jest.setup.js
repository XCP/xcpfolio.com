import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
  })),
  useParams: jest.fn(),
  usePathname: jest.fn(),
}))

// Mock Fathom
jest.mock('fathom-client', () => ({
  load: jest.fn(),
  trackEvent: jest.fn(),
  trackPageview: jest.fn(),
}))

// Mock fetch for API calls
global.fetch = jest.fn()

// Mock Request and Response for Next.js API routes
global.Request = jest.fn((url, init) => ({
  url,
  ...init,
}))

global.Response = jest.fn((body, init) => ({
  json: jest.fn(() => Promise.resolve(body)),
  ...init,
}))