import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import VehicleDetailsContainer from '../VehicleDetailsContainer';

afterEach(cleanup);

describe('VehicleDetailsContainer', () => {
  const keycloak = {};
  const location = {};
  const user = {
    isGovernment: false,
  };

  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <VehicleDetailsContainer
          keycloak={keycloak}
          location={location}
          user={user}
        />
      </BrowserRouter>,
    );
  });
});
