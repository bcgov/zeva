import React from 'react';

// import { render, cleanup } from '@testing-library/react';
import { render } from 'jest';
import VehicleFormDropdown from '../VehicleFormDropdown';


it('renders without crashing', () => {
  render(<VehicleFormDropdown />);
});
