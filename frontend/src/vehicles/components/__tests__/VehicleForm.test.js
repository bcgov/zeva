import React from 'react';
import { render, cleanup } from '@testing-library/react';

import VehicleForm from '../VehicleForm';

afterEach(cleanup);

describe('Vehicle Form', () => {
  it('renders without crashing', () => {
    render(
      <VehicleForm
        loading
        makes={['test', 'test2']}
        vehicleYears={[{ 1: 2020 }]}
        vehicleTypes={[{ 1: 'test' }]}
        vehicleClasses={[{ 1: 'test' }]}
        handleInputChange={() => {}}
        handleSubmit={() => {}}
        setFields={() => {}}
        fields={{ make: 'testcar' }}
        formTitle="test"
      />
    );
  });
});
