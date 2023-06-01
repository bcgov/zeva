import React from 'react'
import { describe, expect, test } from '@jest/globals'
import { render, act } from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom'
import mockAxios from 'jest-mock-axios'
import OrganizationDetailsContainer from '../OrganizationDetailsContainer'

const baseProps = {
  keycloak: {},
  user: {}
}

const mockOrganizationDetailsPage = jest.fn()
jest.mock('../components/OrganizationDetailsPage', () => {
  const OrganizationDetailsPageMock = (props) => {
    mockOrganizationDetailsPage(props)
    return <div>OrganizationDetailsPageMock</div>
  }
  return OrganizationDetailsPageMock
})

afterEach(() => {
  mockAxios.reset()
})

describe('OrganizationDetailsContainer', () => {
  test('renders without crashing', async () => {
    await act(async () => {
      render(
        <Router>
          <OrganizationDetailsContainer
            {...baseProps}
          />
        </Router>
      )
    })
  })

  test('passes loading = true downstream upon first render', async () => {
    await act(async () => {
      render(
        <Router>
          <OrganizationDetailsContainer
            {...baseProps}
          />
        </Router>
      )
    })
    expect(mockOrganizationDetailsPage).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        loading: true
      })
    )
  })

  test('passes loading = false downstream upon last render', async () => {
    await act(async () => {
      render(
        <Router>
          <OrganizationDetailsContainer
            {...baseProps}
          />
        </Router>
      )
    })
    await act(async () => {
      mockAxios.mockResponse({ data: {} })
    })
    expect(mockOrganizationDetailsPage).toHaveBeenLastCalledWith(
      expect.objectContaining({
        loading: false
      })
    )
  })

  test('passes received members downstream', async () => {
    const members = [{ id: 1 }, { id: 2 }, { id: 3 }]
    await act(async () => {
      render(
        <Router>
          <OrganizationDetailsContainer
            {...baseProps}
          />
        </Router>
      )
    })
    await act(async () => {
      mockAxios.mockResponse({ data: {users: members} })
    })
    expect(mockOrganizationDetailsPage).toHaveBeenCalledWith(
      expect.objectContaining({
        members
      })
    )
  })
})
