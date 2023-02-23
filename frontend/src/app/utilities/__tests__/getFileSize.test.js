import { cleanup } from '@testing-library/react'
import getFileSize from '../getFileSize'

afterEach(cleanup)

describe('get file size', () => {
  it('should return 1 KB if we pass 1000', () => {
    expect(getFileSize(1000)).toBe('1 KB')
  })
  it('should return 1 TB if we pass 1000000000000', () => {
    expect(getFileSize(1000000000000)).toBe('1 TB')
  })
  it('should return 1000 TB if we pass 1000000000000000', () => {
    expect(getFileSize(1000000000000000)).toBe('1000 TB')
  })
  it('should return 0 bytes if we pass 0', () => {
    expect(getFileSize(0)).toBe('0 bytes')
  })
})
