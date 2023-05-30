import React from 'react'
import { describe, test } from '@jest/globals'
import { render } from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom'
import OrganizationsTable from '../OrganizationsTable'

const baseProps = {
  filtered: [],
  items: [],
  setFiltered: () => {}
}

describe('OrganizationsTable', () => {
  test('renders without crashing', () => {
    render(
      <Router>
        <OrganizationsTable
          {...baseProps}
        />
      </Router>
    )
  })
})
