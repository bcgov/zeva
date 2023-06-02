import React from 'react'
import { describe, test } from '@jest/globals'
import { render } from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom'
import UsersTable from '../UsersTable'

const baseProps = {
  filtered: [],
  items: [],
  setFiltered: () => {},
  user: {}
}

describe('UsersTable', () => {
  test('renders without crashing', () => {
    render(
      <Router>
        <UsersTable
          {...baseProps}
        />
      </Router>
    )
  })

  test('renders with non-empty items', () => {
    const items = [{ roles: [{ roleCode: 'A' }, { roleCode: 'B' }] }]
    const props = { ...baseProps, items }
    render(
      <Router>
        <UsersTable
          {...props}
        />
      </Router>
    )
  })
})
