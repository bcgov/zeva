import React from 'react';

import { render } from '@testing-library/react';

import VehicleFormDropdown from '../VehicleFormDropdown';


import handleInputChange from '../../VehicleAddContainer'



it('renders without crashing', () => {
  render(<VehicleFormDropdown
    accessor={(model) => model.name}
    dropdownName="Model Year"
    dropdownData={[{ id: 1, name: 'test' }]}
    handleInputChange={handleInputChange}
    fieldName="modelYear"
    selectedOption="test"
  />);
});
