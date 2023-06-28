import React from 'react'
import { describe, expect, test } from '@jest/globals'
import { render } from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom'
import OrganizationListPage from '../OrganizationListPage'

const baseFilters = []

const baseLoading = false

const baseOrganizations = []

const setFiltered = () => {}

const baseUser = {}

const baseProps = {
  filtered: baseFilters,
  loading: baseLoading,
  organizations: baseOrganizations,
  setFiltered,
  user: baseUser
}

jest.mock('../OrganizationsTable', () => {
  const OrganizationsTableMock = () => <div>OrganizationsTableMock</div>
  return OrganizationsTableMock
})

jest.mock('../../../app/components/Loading', () => {
  const LoadingMock = () => <div>LoadingMock</div>
  return LoadingMock
})

describe('OrganizationListPage', () => {
  test('renders without crashing', () => {
    render(
      <Router>
        <OrganizationListPage
          {...baseProps}
        />
      </Router>
    )
  })

  test('renders loading screen when loading prop is true', () => {
    const props = { ...baseProps, loading: true }
    const { queryAllByText } = render(
      <Router>
        <OrganizationListPage
          {...props}
        />
      </Router>
    )
    expect(queryAllByText('LoadingMock')).toHaveLength(1)
  })

  test('renders certain elements when user is govt and has the edit_orgs permission', () => {
    const user = {
      isGovernment: true,
      hasPermission: (permission) => {
        if (permission === 'EDIT_ORGANIZATIONS') {
          return true
        }
      }
    }
    const props = { ...baseProps, user }
    const { queryAllByText } = render(
      <Router>
        <OrganizationListPage
          {...props}
        />
      </Router>
    )
    expect(queryAllByText('New Supplier')).toHaveLength(1)
    expect(queryAllByText('Email Addresses')).toHaveLength(1)
  })

  test('renders certain elements when user is not govt and has the edit_orgs permission', () => {
    const user = {
      isGovernment: false,
      hasPermission: (permission) => {
        if (permission === 'EDIT_ORGANIZATIONS') {
          return false
        }
      }
    }
    const props = { ...baseProps, user }
    const { queryAllByText } = render(
      <Router>
        <OrganizationListPage
          {...props}
        />
      </Router>
    )
    expect(queryAllByText('New Supplier')).toHaveLength(0)
    expect(queryAllByText('Email Addresses')).toHaveLength(0)
  })

  test('renders certain elements when user is govt and does not have the edit_orgs permission', () => {
    const user = {
      isGovernment: true,
      hasPermission: (permission) => {
        if (permission === 'EDIT_ORGANIZATIONS') {
          return false
        }
      }
    }
    const props = { ...baseProps, user }
    const { queryAllByText } = render(
      <Router>
        <OrganizationListPage
          {...props}
        />
      </Router>
    )
    expect(queryAllByText('New Supplier')).toHaveLength(0)
    expect(queryAllByText('Email Addresses')).toHaveLength(1)
  })

  test('renders certain elements when user is not govt and does not have the edit_orgs permission', () => {
    const user = {
      isGovernment: false,
      hasPermission: (permission) => {
        if (permission === 'EDIT_ORGANIZATIONS') {
          return false
        }
      }
    }
    const props = { ...baseProps, user }
    const { queryAllByText } = render(
      <Router>
        <OrganizationListPage
          {...props}
        />
      </Router>
    )
    expect(queryAllByText('New Supplier')).toHaveLength(0)
    expect(queryAllByText('Email Addresses')).toHaveLength(0)
  })
})
