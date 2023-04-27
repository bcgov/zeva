import React from 'react'
import { render, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import VehicleDetailsContainer from '../VehicleDetailsContainer'

afterEach(cleanup)

describe('VehicleDetailsContainer', () => {
  const keycloak = {}
  const location = {}
  const user = {
    isGovernment: false
  }

  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <VehicleDetailsContainer
          keycloak={keycloak}
          location={location}
          user={user}
        />
      </MemoryRouter>
    )
  })
})
