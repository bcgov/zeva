import React from 'react'
import { describe, test } from '@jest/globals'
import { render } from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom'
import CreditRequestListTable from '../CreditRequestListTable'

const emptyFunction = () => {}

const baseProps = {
  page: 1,
  setPage: () => {},
  pageSize: 10,
  setPageSize: emptyFunction,
  filters: [],
  setFilters: emptyFunction,
  setApplyFiltersCount: emptyFunction,
  sorts: [],
  setSorts: emptyFunction,
  items: [{
    id: 1,
    validationStatus: 'DRAFT',
    totals: {
      vins: 0
    }
  }],
  itemsCount: 10,
  loading: false,
  user: {}
}

describe('CreditRequestListTable', () => {
  test('renders without crashing', () => {
    render(
      <Router>
        <CreditRequestListTable
          {...baseProps}
        />
      </Router>
    )
  })
})
