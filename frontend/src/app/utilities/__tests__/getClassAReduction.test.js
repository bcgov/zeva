import getClassAReduction from '../getClassAReduction'

describe('getClassAReduction', () => {
  it('should return 0 if supplier class is not L', () => {
    const result = getClassAReduction(1000, 50, 'M')

    expect(result).toBe(0)
  })

  it('should return 0 if ldvSales is not defined', () => {
    const result = getClassAReduction(undefined, 50, 'L')

    expect(result).toBe(0)
  })

  it('should return correct class A reduction', () => {
    const result = getClassAReduction(1000, 50, 'L')

    expect(result).toBe(500)
  })

  it('should return class A reduction with only 2 decimal places', () => {
    const result = getClassAReduction(1000, 33.33333, 'L')

    expect(result).toBeCloseTo(333.33, 2)
  })
})
