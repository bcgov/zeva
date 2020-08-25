import React from 'react';
import {
  render, cleanup, getByTestId, fireEvent, getByRole,
} from '@testing-library/react';
import jest from 'jest-mock';
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
  it('renders a clickable button', () => {
    const handleClick = jest.fn();
    const { getByRole } = render(
      <ActivityBanner
        colour="blue"
        icon="car"
        boldText="ZEV Models"
        regularText="1 submitted for validation"
        linkTo="/"
      />,
    );
    const button = getByRole('button', { name: 'ZEV Models — 1 submitted for validation' });
    console.log(button);
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  it('is not a clickable button if there is no current activity', () => {
    const handleClick = jest.fn();
    const { container } = render(<ActivityBanner
      colour="green"
      icon="car"
      boldText="ZEV Models"
      regularText="no current activity"
      className="no-hover"
    />);
    // const button = getByText('ZEV Models').parentElement.parentElement;
    fireEvent.click(container);
    expect(handleClick).toHaveBeenCalledTimes(0);
  });
  it('renders a green no activity button', () => {
    const { getByTestId } = render(<ActivityBanner
      colour="blue"
      icon="car"
      boldText="ZEV Models"
      regularText="no current activity"
      className="no-hover"
    />);
    expect(getByTestId('activity-button').toHaveClass('no-hover'));
  });
});
