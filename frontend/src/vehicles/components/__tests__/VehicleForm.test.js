import React from 'react';

import { render, cleanup } from '@testing-library/react';

import VehicleForm from '../VehicleForm';


afterEach(cleanup);

describe('Vehicle Form', () => {
  it('renders without crashing', () => {
    render(<VehicleForm
      loading="true"
      vehicleMakes={[1, 2]}
      vehicleYears={[2020]}
      vehicleTypes={[1]}
      vehicleClasses={[1]}
      handleInputChange={VehicleForm.handleInputChange()}
      handleSubmit={VehicleForm.handleSubmit()}
      fields={{ test }}
      formTitle="test"
    />);
  });
});
