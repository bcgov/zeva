import React from 'react'
import { render, cleanup, findByTestId } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Router from '../router'
import axios from 'axios'

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

axios.get
  .mockImplementationOnce(() => Promise.resolve(successfulResponse))
  .mockImplementationOnce(() => Promise.resolve(dashboardResponse))
  .mockImplementation(() => Promise.reject(failedResponse))
  .mockImplementation(() => Promise.reject(failedResponse))

describe('Router Success', () => {
  const keycloak = {}
  const logout = jest.fn()

  it('does not load the unverified page when current user call is successful', () => {
    const { container } = render(
      <BrowserRouter>
        <Router
          keycloak={keycloak}
          logout={logout}
        />
      </BrowserRouter>
    )
    const unverified = findByTestId(container, 'unverified-user')
    expect(unverified).not.toBeInTheDocument()
  })

  it('loads the unverified page when the current user call failes', () => {
    const { container } = render(
      <BrowserRouter>
        <Router
          keycloak={keycloak}
          logout={logout}
        />
      </BrowserRouter>
    )
    const unverified = findByTestId(container, 'unverified-user')
    expect(unverified).toBeInTheDocument()
  })

  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <Router
          keycloak={keycloak}
          logout={logout}
        />
      </BrowserRouter>
    )
  })
})
