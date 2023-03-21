import React from 'react'
import { render, cleanup } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'

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
      <BrowserRouter>
        <VehicleListContainer
          keycloak={keycloak}
          location={location}
          user={user}
        />
      </BrowserRouter>
    )
  })
})
