import React from 'react'
import { describe, expect, test } from '@jest/globals'
import { render, act } from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom'
import axios from 'axios'
import OrganizationListContainer from '../OrganizationListContainer'

const baseUser = {}

const baseProps = {
  keycloak: {},
  user: baseUser
}

const baseOrganizations = []

const mockOrganizationListPage = jest.fn()
jest.mock('../components/OrganizationListPage', () => {
  const OrganizationListPageMock = (props) => {
    mockOrganizationListPage(props)
    return <div>OrganizationListPageMock</div>
  }
  return OrganizationListPageMock
})

jest.mock('axios', () => {
  const originalModule = jest.requireActual('axios')
  return {
    __esModule: true,
    ...originalModule
  }
})

beforeEach(() => {
  jest.spyOn(axios, 'get').mockImplementation((url) => {
    return Promise.resolve({ data: baseOrganizations })
  })
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
    jest.spyOn(axios, 'get').mockImplementation((url) => {
      return Promise.resolve({ data: organizations })
    })
    await act(async () => {
      render(
        <Router>
          <OrganizationListContainer
            {...baseProps}
          />
        </Router>
      )
    })
    expect(mockOrganizationListPage).toHaveBeenCalledWith(
      expect.objectContaining({
        organizations: []
      })
    )
  })

  test('passes received organizations downstream if government user', async () => {
    const organizations = [{ id: 1 }, { id: 2 }, { id: 3 }]
    jest.spyOn(axios, 'get').mockImplementation((url) => {
      return Promise.resolve({ data: organizations })
    })
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
    expect(mockOrganizationListPage).toHaveBeenCalledWith(
      expect.objectContaining({
        organizations
      })
    )
  })
})
