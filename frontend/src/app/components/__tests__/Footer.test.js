import React from 'react'
import { render, cleanup } from '@testing-library/react'
import Footer from '../Footer'

require('@babel/core')
require('@babel/polyfill')

afterEach(cleanup)

describe('footer', () => {
  it('renders without crashing', () => {
    render(<Footer />)
  })
})
