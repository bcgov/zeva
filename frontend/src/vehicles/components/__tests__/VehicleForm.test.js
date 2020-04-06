import React from 'react';

import { render, cleanup } from '@testing-library/react';

import VehicleForm from '../VehicleForm';
import VehicleAddContainer from '../../VehicleAddContainer';

afterEach(cleanup);

const handleInputChange = (event) => {
  const { value, name } = event.target;
  console.log('test function');
};

const handleSubmit = (event) => {
  console.log('submt function');
};

describe('Vehicle Form', () => {
  it('renders without crashing', () => {
    render(<VehicleForm
      loading="true"
      vehicleMakes={[1, 2]}
      vehicleYears={[2020]}
      vehicleTypes={[1]}
      vehicleClasses={[1]}
      handleInputChange={handleSubmit()}
      handleSubmit={handleSubmit()}
      fields={{ make: 'testcar' }}
      formTitle="test"
    />);
  });
});
