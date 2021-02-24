import React from 'react';
import { render, cleanup } from '@testing-library/react';

import VehicleAlert from '../VehicleAlert';

afterEach(cleanup);

describe('VehicleAlert', () => {
  it('renders without crashing', () => {
    render(<VehicleAlert optionalMessage="Test" />);
  });
});
