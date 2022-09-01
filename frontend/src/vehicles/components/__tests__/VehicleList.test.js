import React from 'react';
import { render, cleanup } from '@testing-library/react';

import VehicleList from '../VehicleList';

afterEach(cleanup);

describe('Vehicle List', () => {
  it('renders without crashing', () => {
    const user = {
      isGovernment: false
    };

    render(
      <VehicleList
        loading={false}
        vehicles={[]}
        user={user}
        filtered={[]}
        setFiltered={() => {}}
        handleClear={() => {}}
      />
    );
  });
});
