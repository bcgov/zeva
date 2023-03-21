import React from 'react'
import { render, cleanup } from '@testing-library/react'
import ErrorHandler from '../ErrorHandler'

require('@babel/core')
require('@babel/polyfill')

afterEach(cleanup)

describe('error handler', () => {
  it('renders without crashing', () => {
    render(
      <ErrorHandler>
        <div />{' '}
      </ErrorHandler>
    )
  })
})
