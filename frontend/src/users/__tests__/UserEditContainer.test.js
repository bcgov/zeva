import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import UserEditContainer from '../UserEditContainer';

afterEach(cleanup);

describe('UserEditContainer', () => {
  const keycloak = {};
  const location = {};
  const user = {
    isGovernment: false,
    organization: {
      id: 2
    }
  };

  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <UserEditContainer
          keycloak={keycloak}
          location={location}
          user={user}
        />
      </BrowserRouter>
    );
  });
});
