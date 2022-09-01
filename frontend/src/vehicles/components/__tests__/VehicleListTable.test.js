import React from 'react';
import { render, cleanup } from '@testing-library/react';

import VehicleListTable from '../VehicleListTable';

afterEach(cleanup);

describe('Vehicle List', () => {
  it('renders without crashing', () => {
    const user = {
      isGovernment: false
    };

    render(
      <VehicleListTable
        items={[]}
        user={user}
        filtered={[]}
        setFiltered={() => {}}
        showSupplier
      />
    );
  });
});
