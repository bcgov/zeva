import React from 'react';
import {
  render, cleanup, getByTestId, fireEvent, getByRole,
} from '@testing-library/react';
import jest from 'jest-mock';
import ActivityBanner from '../ActivityBanner';
import history from '../../../app/History';

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
  it('renders a clickable button', () => {
    const handleClick = jest.fn();
    const { getByRole } = render(
      <ActivityBanner
        colour="blue"
        icon="car"
        boldText="ZEV Models"
        regularText="1 submitted for validation"
        linkTo="/models"
      />,
    );
    const button = getByRole('button', { name: 'ZEV Models — 1 submitted for validation' });
    fireEvent.click(button);
    expect(history.location.pathname).toEqual('/models');
  });
});
