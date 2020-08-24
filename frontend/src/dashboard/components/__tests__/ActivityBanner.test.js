import React from 'react';
import {
  render, cleanup, getByTestId, fireEvent, getByPlaceholderText,
} from '@testing-library/react';
import ActivityBanner from '../ActivityBanner';

require('@babel/core');
require('@babel/polyfill');

afterEach(cleanup);

describe('activity banner', () => {
  it('renders without crashing', () => {
    render(<ActivityBanner
      colour="blue"
      icon="car"
      boldText="ZEV Models"
      regularText="1 submitted for validation"
    />);
  });
});
