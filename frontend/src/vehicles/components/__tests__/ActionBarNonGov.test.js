import React from 'react'
import { render } from '@testing-library/react'
import ActionBarNonGov from '../ActionBarNonGov'

it('renders without crashing', () => {
  render(
    <ActionBarNonGov
      handleClear={() => {}}
      filtered={[]}
      setFiltered={() => {}}
    />
  )
})
