import { cleanup } from '@testing-library/react'
import formatNumeric from '../formatNumeric'

afterEach(cleanup)

describe('format numeric', () => {
  it('it should pass back original value if it is not a number', () => {
    expect(formatNumeric('1,000')).toBe('1,000')
  })
  it('should return 3.00 if we pass it 3', () => {
    expect(formatNumeric(3)).toBe('3.00')
  })
})
