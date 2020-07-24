import React from 'react';
import { render } from '@testing-library/react';
import CreditTransactions from '../CreditTransactions';
import '@testing-library/jest-dom/extend-expect';

const data = [
  {
    creditValue: '30.00',
    creditTo:
        {
          id: 1,
          name: 'Government of British Columbia',
          organizationAddress: null,
          createTimestamp: '2020-02-12T10:07:35.768433-08:00',
        },
    balance: { A: -60, B: -50 },
    debitFrom: {
      id: 3,
      name: 'BMW Canada Inc.',
      organizationAddress: null,
      createTimestamp: '2020-02-12T10:08:09.566993-08:00',
      balance: { A: 80, B: 60 },
    },
    transactionTimestamp: '2020-01-01T00:00:00-08:00',
    creditClass: { creditClass: 'A' },
    transactionType: { transactionType: 'Validation' },
    id: 4,
  },
];

const user = {
  organization: {
    balance: {
      A: 0,
      B: 0,
    },
  },
};

it('renders without crashing', () => {
  render(<CreditTransactions title="hello" items={data} user={user} />);
});

it('renders hello as the title', () => {
  const { getByText } = render(<CreditTransactions title="hello" items={data} user={user} />);
  expect(getByText('hello')).toBeInTheDocument();
});
