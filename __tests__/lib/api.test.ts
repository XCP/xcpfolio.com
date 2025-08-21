import { 
  parseAssetName, 
  formatPrice, 
  formatAge, 
  formatRegistrationDate 
} from '@/lib/api'

describe('API utility functions', () => {
  describe('parseAssetName', () => {
    it('should remove XCPFOLIO prefix from asset names', () => {
      expect(parseAssetName('XCPFOLIO.BITCOIN')).toBe('BITCOIN')
      expect(parseAssetName('XCPFOLIO.ETH')).toBe('ETH')
    })

    it('should return original name if no XCPFOLIO prefix', () => {
      expect(parseAssetName('BITCOIN')).toBe('BITCOIN')
      expect(parseAssetName('ETH')).toBe('ETH')
    })
  })

  describe('formatPrice', () => {
    it('should format divisible asset prices correctly', () => {
      expect(formatPrice(100000000, true)).toBe('1')
      expect(formatPrice(1000000000, true)).toBe('10')
      expect(formatPrice(50000000, true)).toBe('0.5')
      expect(formatPrice(12345678, true)).toBe('0.12345678')
    })

    it('should format indivisible asset prices correctly', () => {
      expect(formatPrice(100, false)).toBe('100')
      expect(formatPrice(1, false)).toBe('1')
      expect(formatPrice(1000000, false)).toBe('1000000')
    })

    it('should remove trailing zeros', () => {
      expect(formatPrice(100000000, true)).toBe('1')
      expect(formatPrice(150000000, true)).toBe('1.5')
      expect(formatPrice(123000000, true)).toBe('1.23')
    })
  })

  describe('formatAge', () => {
    it('should format age in years correctly', () => {
      const now = Date.now() / 1000
      const oneYearAgo = now - (365 * 24 * 60 * 60)
      const twoYearsAgo = now - (2 * 365 * 24 * 60 * 60)
      
      expect(formatAge(oneYearAgo)).toBe('1 year old')
      expect(formatAge(twoYearsAgo)).toBe('2 years old')
    })

    it('should format age in months correctly', () => {
      const now = Date.now() / 1000
      const oneMonthAgo = now - (30 * 24 * 60 * 60)
      const threeMonthsAgo = now - (90 * 24 * 60 * 60)
      
      expect(formatAge(oneMonthAgo)).toMatch(/month/)
      expect(formatAge(threeMonthsAgo)).toMatch(/months/)
    })

    it('should format today correctly', () => {
      const now = Date.now() / 1000
      expect(formatAge(now)).toBe('Today')
    })

    it('should handle undefined timestamp', () => {
      expect(formatAge(undefined)).toBe('')
    })
  })

  describe('formatRegistrationDate', () => {
    it('should return empty string for undefined', () => {
      expect(formatRegistrationDate(undefined)).toBe('')
    })

    it('should format dates with correct pattern', () => {
      const timestamp = Date.now() / 1000
      const result = formatRegistrationDate(timestamp)
      expect(result).toMatch(/^Registered \w{3} \d{4}$/)
    })
  })
})