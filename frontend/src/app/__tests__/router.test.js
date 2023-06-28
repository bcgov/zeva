import React from 'react'
import { render, cleanup, queryByTestId, findByTestId } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Router from '../router'
import axios from 'axios'
import '@testing-library/jest-dom/extend-expect'

afterEach(cleanup)

jest.mock('axios')

const successfulResponse = {
  data: {
    id: 1,
    displayName: 'Tester 1',
    email: 'test@gov.bc.ca',
    firstName: 'Tester',
    lastName: '1',
    isActive: true,
    isGovernment: true,
    keycloakEmail: 'test@gov.bc.ca',
    organization: {
      avgLdvSales: null,
      balance: { A: 0, B: 0 },
      createTimestamp: '2022-10-11T10:44:53.087843-07:00',
      hasSubmittedReport: false,
      id: 1,
      isActive: true,
      isGovernment: true,
      ldvSales: [],
      name: 'Government of British Columbia',
      organizationAddress: [],
      shortName: null,
      supplierClass: 'S'
    }
  }
}
const dashboardResponse = {
  data:
  [
    {
      activity: {
        vehicle: { name: 'test' },
        creditAgreement: [{ agreement: { status: 'test' } }]
      }
    }
  ]
}
const failedResponse = { detail: 'failed verification' }

describe('Router Success', () => {
  const keycloak = {}
  const logout = jest.fn()
  beforeEach(() => {
    axios.get.mockReset()
  })

  it('does not load the unverified page when current user call is successful', () => {
    axios.get.mockImplementationOnce(() => Promise.resolve(successfulResponse))
    axios.get.mockImplementationOnce(() => Promise.resolve(dashboardResponse))
    const { container } = render(
      <MemoryRouter>
        <Router
          keycloak={keycloak}
          logout={logout}
        />
      </MemoryRouter>
    )
    const unverifiedUser = queryByTestId(container, 'unverified-user')
    expect(unverifiedUser).not.toBeInTheDocument()
  })

  it('loads the unverified page when the current user call fails', async () => {
    axios.get.mockImplementationOnce(() => Promise.reject(failedResponse))
    const { container } = render(
      <MemoryRouter>
        <Router
          keycloak={keycloak}
          logout={logout}
        />
      </MemoryRouter>
    )
    const unverifiedUser = await findByTestId(container, 'unverified-user')
    expect(unverifiedUser).toBeInTheDocument()
  })

  it('renders without crashing', () => {
    axios.get.mockImplementationOnce(() => Promise.reject(failedResponse))
    render(
      <MemoryRouter>
        <Router
          keycloak={keycloak}
          logout={logout}
        />
      </MemoryRouter>
    )
  })
})
