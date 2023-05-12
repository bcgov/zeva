import getUnspecifiedClassReduction from '../getUnspecifiedClassReduction'

describe('getUnspecifiedClassReduction', () => {
  it('should return 0 if totalReduction is NaN', () => {
    const result = getUnspecifiedClassReduction('abc', 50)

    expect(result).toBe(0)
  })

  it('should return 0 if classAReduction is NaN', () => {
    const result = getUnspecifiedClassReduction(100, 'abc')

    expect(result).toBe(0)
  })

  it('should return 0 if both totalReduction and classAReduction are NaN', () => {
    const result = getUnspecifiedClassReduction('abc', 'def')

    expect(result).toBe(0)
  })

  it('should return correct unspecified class reduction', () => {
    const result = getUnspecifiedClassReduction(500, 200)

    expect(result).toBe(300)
  })

  it('should return unspecified class reduction with only 2 decimal places', () => {
    const result = getUnspecifiedClassReduction(1234.5678, 456.789)

    expect(result).toBeCloseTo(777.78, 2)
  })
})
