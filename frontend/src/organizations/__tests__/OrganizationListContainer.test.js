import React from 'react'
import { describe, expect, test } from '@jest/globals'
import { render, act } from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom'
import mockAxios from 'jest-mock-axios'
import OrganizationListContainer from '../OrganizationListContainer'

const baseUser = {}

const baseProps = {
  keycloak: {},
  user: baseUser
}

const mockOrganizationListPage = jest.fn()
jest.mock('../components/OrganizationListPage', () => {
  const OrganizationListPageMock = (props) => {
    mockOrganizationListPage(props)
    return <div>OrganizationListPageMock</div>
  }
  return OrganizationListPageMock
})

afterEach(() => {
  mockAxios.reset()
})

describe('OrganizationListContainer', () => {
  test('renders without crashing', async () => {
    await act(async () => {
      render(
        <Router>
          <OrganizationListContainer
            {...baseProps}
          />
        </Router>
      )
    })
  })

  test('does not pass received organizations downstream if not government user', async () => {
    const organizations = [{ id: 1 }, { id: 2 }, { id: 3 }]
    await act(async () => {
      render(
        <Router>
          <OrganizationListContainer
            {...baseProps}
          />
        </Router>
      )
    })
    await act(async () => {
      mockAxios.mockResponse({ data: organizations }, null, true)
    })
    expect(mockOrganizationListPage).toHaveBeenCalledWith(
      expect.objectContaining({
        organizations: []
      })
    )
  })

  test('passes received organizations downstream if government user', async () => {
    const organizations = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const props = { ...baseProps, user: { isGovernment: true } }
    await act(async () => {
      render(
        <Router>
          <OrganizationListContainer
            {...props}
          />
        </Router>
      )
    })
    await act(async () => {
      mockAxios.mockResponse({ data: organizations })
    })
    expect(mockOrganizationListPage).toHaveBeenCalledWith(
      expect.objectContaining({
        organizations
      })
    )
  })
})
