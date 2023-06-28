import React from 'react'
import { render, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import VehicleListContainer from '../VehicleListContainer'

afterEach(cleanup)

describe('VehicleListContainer', () => {
  const keycloak = {}
  const location = {}
  const user = {
    isGovernment: false
  }

  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <VehicleListContainer
          keycloak={keycloak}
          location={location}
          user={user}
        />
      </MemoryRouter>
    )
  })
})
