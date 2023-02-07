import React from 'react';
import { Link, MemoryRouter } from 'react-router-dom';
import { render, cleanup, fireEvent } from '@testing-library/react';

import ComplianceTabs from '../ComplianceTabs';

afterEach(cleanup);

const user = {
  isGovernment: false,
  hasPermission: jest.fn().mockReturnValue(true)
};

test('renders tab for Model Year Reports', () => {
  const { getByText } = render(
    <MemoryRouter>
      <ComplianceTabs active="reports" user={user} />
    </MemoryRouter>
  );
  const linkElement = getByText(/Model Year Reports/i);
  expect(linkElement).toBeTruthy();
});

test('renders tab for Compliance Ratios', () => {
  const { getByText } = render(
    <MemoryRouter>
      <ComplianceTabs active="ratios" user={user} />
    </MemoryRouter>
  );
  const linkElement = getByText(/Compliance Ratios/i);
  expect(linkElement).toBeTruthy();
});

test('renders tab for Compliance Calculator', () => {
  const { getByText } = render(
    <MemoryRouter>
      <ComplianceTabs active="calculator" user={user} />
    </MemoryRouter>
  );
  const linkElement = getByText(/Compliance Calculator/i);
  expect(linkElement).toBeTruthy();
});

test('does not render tab for Compliance Calculator for government users', () => {
  const governmentUser = {
    isGovernment: true,
    hasPermission: jest.fn().mockReturnValue(false)
  };
  const { queryByText } = render(
    <MemoryRouter>
      <ComplianceTabs active="calculator" user={governmentUser} />
    </MemoryRouter>
  );
  const linkElement = queryByText(/Compliance Calculator/i);
  expect(linkElement).toBeNull();
});
