import React from 'react'
import { render, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import VehicleEditContainer from '../VehicleEditContainer'

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    all: jest.fn(() => Promise.resolve({ data: 'data' })),
    get: jest.fn(() => Promise.resolve({ data: 'data' })),
    spread: jest.fn(() => Promise.resolve({ data: 'data' }))
  }
}))

afterEach(cleanup)

describe('VehicleEditContainer', () => {
  const keycloak = {}
  const location = {}
  const user = {
    isGovernment: false
  }

  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <VehicleEditContainer
          keycloak={keycloak}
          location={location}
          user={user}
        />
      </MemoryRouter>
    )
  })
})
