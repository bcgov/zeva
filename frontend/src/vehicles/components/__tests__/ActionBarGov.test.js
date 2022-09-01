import React from 'react';
import { render } from '@testing-library/react';
import ActionBarGov from '../ActionBarGov';

const vehicles = [];
const handleSubmit = () => {
  console.log('test');
};
it('renders without crashing', () => {
  render(
    <ActionBarGov
      handleClear={() => {
        console.log('hi');
      }}
      handleSubmit={() => {
        console.log('hi');
      }}
      setFiltered={() => {
        console.log('hi');
      }}
      filtered={[{ 1: 'test' }]}
      vehicles={vehicles}
    />
  );
});
() => {
  console.log('hi');
};
