import React from 'react';

import { render, cleanup } from '@testing-library/react';

import VehicleForm from '../VehicleForm';
import VehicleAddContainer from '../../VehicleAddContainer';

afterEach(cleanup);

const handleInputChange = () => {
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
      handleInputChange={() => { console.log('hi'); }}
      handleSubmit={() => { console.log('hi'); }}
      setFields={() => { console.log('hi'); }}
      fields={{ make: 'testcar' }}
      formTitle="test"
    />);
  });
});
