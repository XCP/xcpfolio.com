import { parseAssetName, formatPrice } from '@/lib/api'

describe('API helper functions', () => {
  describe('parseAssetName', () => {
    it('should parse XCPFOLIO subasset names correctly', () => {
      expect(parseAssetName('XCPFOLIO.BITCOIN')).toBe('BITCOIN')
      expect(parseAssetName('XCPFOLIO.ETH')).toBe('ETH')
      expect(parseAssetName('XCPFOLIO.123')).toBe('123')
    })

    it('should return name unchanged if no XCPFOLIO prefix', () => {
      expect(parseAssetName('BITCOIN')).toBe('BITCOIN')
      expect(parseAssetName('ETH')).toBe('ETH')
    })
  })

  describe('formatPrice', () => {
    it('should format XCP prices correctly', () => {
      expect(formatPrice(100000000)).toBe('1')
      expect(formatPrice(1000000000)).toBe('10')
      expect(formatPrice(550000000)).toBe('5.5')
      expect(formatPrice(12345678)).toBe('0.12345678')
    })

    it('should handle zero price', () => {
      expect(formatPrice(0)).toBe('0')
    })

    it('should remove trailing zeros', () => {
      expect(formatPrice(150000000)).toBe('1.5')
      expect(formatPrice(100500000)).toBe('1.005')
    })
  })
})