import React from 'react';
import TestRenderer from 'react-test-renderer';
import { render, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ErrorHandler from '../ErrorHandler';

require('@babel/core');
require('@babel/polyfill');

afterEach(cleanup);

describe('error handler', () => {
  it('renders without crashing', () => {
    render(<ErrorHandler><div /> </ErrorHandler>);
  });
});
