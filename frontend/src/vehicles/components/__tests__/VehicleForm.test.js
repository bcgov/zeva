import React from 'react';

import { render, cleanup } from '@testing-library/react';

import VehicleForm from '../VehicleForm';

afterEach(cleanup);

const handleInputChange = (event) => {
  const { value, name } = event.target;
  console.log('test function');
};

const handleSubmit = () => {
  console.log('submt function');
};

describe('Vehicle Form', () => {
  it('renders without crashing', () => {
    render(<VehicleForm
      loading
      makes={['test', 'test2']}
      vehicleYears={[{ 1: 2020 }]}
      vehicleTypes={[{ 1: 'test' }]}
      vehicleClasses={[{ 1: 'test' }]}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      setFields={() => { console.log('hi'); }}
      fields={{ make: 'testcar' }}
      formTitle="test"
    />);
  });
});
