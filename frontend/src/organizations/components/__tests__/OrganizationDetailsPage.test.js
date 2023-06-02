import React from 'react'
import { describe, expect, test } from '@jest/globals'
import { render } from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom'
import OrganizationDetailsPage from '../OrganizationDetailsPage'

const baseDetails = {}

const baseFilters = []

const baseLoading = false

const baseMembers = []

const setFiltered = () => {}

const baseUser = { hasPermission: () => {} }

const baseProps = {
  details: baseDetails,
  filtered: baseFilters,
  loading: baseLoading,
  members: baseMembers,
  setFiltered,
  user: baseUser
}

jest.mock('../UsersTable', () => {
  const UsersTableMock = () => <div>UsersTableMock</div>
  return UsersTableMock
})

jest.mock('../../../app/components/Loading', () => {
  const LoadingMock = () => <div>LoadingMock</div>
  return LoadingMock
})

describe('OrganizationDetailsPage', () => {
  test('renders withut crashing', () => {
    render(
      <Router>
        <OrganizationDetailsPage
          {...baseProps}
        />
      </Router>
    )
  })

  test('renders loading screen when loading prop is true', () => {
    const props = { ...baseProps, loading: true }
    const { queryAllByText } = render(
      <Router>
        <OrganizationDetailsPage
          {...props}
        />
      </Router>
    )
    expect(queryAllByText('LoadingMock')).toHaveLength(1)
  })

  test('renders details name if details.isGovernment = true', () => {
    const details = {
      name: 'test name',
      isGovernment: true
    }
    const props = { ...baseProps, details }
    const { queryAllByText } = render(
      <Router>
        <OrganizationDetailsPage
          {...props}
        />
      </Router>
    )
    expect(queryAllByText(details.name)).toHaveLength(1)
  })

  test('renders "Vehicle Supplier Information" if details.isGovernment = false', () => {
    const details = {
      isGovernment: false
    }
    const props = { ...baseProps, details }
    const { queryAllByText } = render(
      <Router>
        <OrganizationDetailsPage
          {...props}
        />
      </Router>
    )
    expect(queryAllByText('Vehicle Supplier Information')).toHaveLength(1)
  })

  test('renders certain elements if details.isGovernment = false and details.organizationAddress is defined', () => {
    const details = {
      isGovernment: false,
      organizationAddress: [{ addressType: {} }, { addressType: {} }]
    }
    const props = { ...baseProps, details }
    const { queryAllByText } = render(
      <Router>
        <OrganizationDetailsPage
          {...props}
        />
      </Router>
    )
    expect(queryAllByText('Legal name:')).toHaveLength(1)
    expect(queryAllByText('Common name:')).toHaveLength(1)
    expect(queryAllByText('Address:')).toHaveLength(details.organizationAddress.length)
    expect(queryAllByText('Request change to name or address')).toHaveLength(1)
  })

  test('does not render certain elements if details.isGovernment = true details.organizationAddress is defined', () => {
    const details = {
      isGovernment: true,
      organizationAddress: [{ addressType: {} }, { addressType: {} }]
    }
    const props = { ...baseProps, details }
    const { queryAllByText } = render(
      <Router>
        <OrganizationDetailsPage
          {...props}
        />
      </Router>
    )
    expect(queryAllByText('Legal name:')).toHaveLength(0)
    expect(queryAllByText('Common name:')).toHaveLength(0)
    expect(queryAllByText('Address:')).toHaveLength(0)
    expect(queryAllByText('Request change to name or address')).toHaveLength(0)
  })

  test('does not render certain elements if details.isGovernment = false and details.organizationAddress is not defined', () => {
    const details = {
      isGovernment: false
    }
    const props = { ...baseProps, details }
    const { queryAllByText } = render(
      <Router>
        <OrganizationDetailsPage
          {...props}
        />
      </Router>
    )
    expect(queryAllByText('Legal name:')).toHaveLength(0)
    expect(queryAllByText('Common name:')).toHaveLength(0)
    expect(queryAllByText('Address:')).toHaveLength(0)
    expect(queryAllByText('Request change to name or address')).toHaveLength(0)
  })

  test('renders "New User" button is user has EDIT_USERS permission', () => {
    const user = {
      hasPermission: (permission) => {
        if (permission === 'EDIT_USERS') {
          return true
        }
      }
    }
    const props = { ...baseProps, user }
    const { queryAllByText } = render(
      <Router>
        <OrganizationDetailsPage
          {...props}
        />
      </Router>
    )
    expect(queryAllByText('New User')).toHaveLength(1)
  })

  test('does not render "New User" button is user does not have the EDIT_USERS permission', () => {
    const user = {
      hasPermission: (permission) => {
        if (permission === 'EDIT_USERS') {
          return false
        }
      }
    }
    const props = { ...baseProps, user }
    const { queryAllByText } = render(
      <Router>
        <OrganizationDetailsPage
          {...props}
        />
      </Router>
    )
    expect(queryAllByText('New User')).toHaveLength(0)
  })
})
