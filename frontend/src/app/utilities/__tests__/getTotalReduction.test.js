import getTotalReduction from '../getTotalReduction'

describe('getTotalReduction', () => {
  it('should return 0 if ldvSales is not defined', () => {
    const result = getTotalReduction(undefined, 50)

    expect(result).toBe(0)
  })

  it('should return 0 if ldvSales is NaN', () => {
    const result = getTotalReduction('abc', 50)

    expect(result).toBe(0)
  })

  it('should return correct total reduction', () => {
    const result = getTotalReduction(1000, 50)

    expect(result).toBe(500)
  })

  it('should return total reduction with only 2 decimal places', () => {
    const result = getTotalReduction(1000, 33.33333)

    expect(result).toBeCloseTo(333.33, 2)
  })
})
