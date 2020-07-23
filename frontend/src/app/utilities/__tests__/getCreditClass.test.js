import React from 'react';
import {
  render, cleanup, getByTestId, fireEvent,
} from '@testing-library/react';
import getCreditClass from '../getCreditClass';

require('@babel/core');
require('@babel/polyfill');

afterEach(cleanup);

describe('get credit class', () => {
  it('should return B if vehicle is not BEV and range >= 16', () => {
    const vehicle = { range: 20, vehicleZevType: { vehicleZevCode: 'PHEV' } };
    expect(getCreditClass(vehicle)).toBe('B');
  });
  it('should return A if vehicle is BEV and range >= 80.47', () => {
    const vehicle = { range: 90, vehicleZevType: { vehicleZevCode: 'BEV' } };
    expect(getCreditClass(vehicle)).toBe('A');
  });
  it('should return C if vehicle is BEV and range < 80.47', () => {
    const vehicle = { range: 80, vehicleZevType: { vehicleZevCode: 'BEV' } };
    expect(getCreditClass(vehicle)).toBe('C');
  });
  it('should return C if vehicle is not BEV and range < 16', () => {
    const vehicle = { range: 15, vehicleZevType: { vehicleZevCode: 'PHEV' } };
    expect(getCreditClass(vehicle)).toBe('C');
  });
});
