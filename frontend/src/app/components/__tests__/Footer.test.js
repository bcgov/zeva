import React from 'react';
import TestRenderer from 'react-test-renderer';
import { render, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../Footer';

require('@babel/core');
require('@babel/polyfill');

afterEach(cleanup);

describe('footer', () => {
  it('renders without crashing', () => {
    render(<Footer />);
  });
});
