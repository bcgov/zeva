import React from 'react'
import { render, cleanup } from '@testing-library/react'

import VehicleDetailsPage from '../VehicleDetailsPage'

afterEach(cleanup)

describe('VehicleDetailsPage', () => {
  const details = {}
  const user = {
    isGovernment: false
  }

  it('renders without crashing', () => {
    render(
      <VehicleDetailsPage
        loading
        details={details}
        requestStateChange={() => {}}
        user={user}
        isActiveChange={() => {}}
      />
    )
  })
})
