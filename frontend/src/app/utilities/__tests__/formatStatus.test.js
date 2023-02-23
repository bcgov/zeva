import { cleanup } from '@testing-library/react'
import formatStatus from '../formatStatus'

afterEach(cleanup)

describe('format status', () => {
  it('should return recommend approval if we pass in RECOMMEND_APPROVAL', () => {
    expect(formatStatus('RECOMMEND_APPROVAL')).toBe('recommend approval')
  })
  it('should return recommend approval if we pass in ReCommend APProvaL', () => {
    expect(formatStatus('ReCommend APProvaL')).toBe('recommend approval')
  })
})
