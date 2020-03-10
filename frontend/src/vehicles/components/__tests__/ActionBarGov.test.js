import React from 'react';
import { render } from '@testing-library/react';
import ActionBarGov from '../ActionBarGov';

const vehicles = [];
const handleSubmit = () => { console.log('test'); };
it('renders without crashing', () => {
  render(<ActionBarGov handleSubmit={handleSubmit} vehicles={vehicles} />);
});
