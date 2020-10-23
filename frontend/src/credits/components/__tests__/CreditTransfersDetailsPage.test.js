import React from 'react';
import {
  cleanup,
  render,
  findByTestId,
  fireEvent,
  queryByText,
  getByAltText,
  getByText,
  getByTestId,
} from '@testing-library/react';
import CreditTransfersDetailsPage from '../CreditTransfersDetailsPage';
import '@testing-library/jest-dom/extend-expect';
import { BrowserRouter as Router } from 'react-router-dom';

const submission = {
  creditTo: {
    balance: { A: 0, B: 0 },
    createTimestamp: '2020-05-26T09:27:21.098202-07:00',
    id: 1,
    isActive: true,
    isGovernment: false,
    name: 'FCA Canada Inc.',
    organizationAddress: [],
    shortName: null,
  },
  creditTransferComment: null,
  creditTransferContent: [
    {
      creditValue: '100.00',
      dollarValue: '75.00',
      creditClass: { creditClass: 'A' },
      modelYear: { name: '2020' },
    },
    {
      creditValue: '110.00',
      dollarValue: '25.00',
      creditClass: { creditClass: 'A' },
      modelYear: { name: '2019' },
    },
    {
      creditValue: '5.00',
      dollarValue: '86.00',
      creditClass: { creditClass: 'A' },
      modelYear: { name: '2018' },
    },
    {
      creditValue: '30.00',
      dollarValue: '75.00',
      creditClass: { creditClass: 'A' },
      modelYear: { name: '2020' },
    },
  ],
  debitFrom:
  {
    balance: {
      A: 0,
      B: 40.55,
    },
    createTimestamp: '2020-05-26T09:27:21.121946-07:00',
    id: 61,
    isActive: true,
    isGovernment: false,
    name: 'Toyota Canada Inc.',
    organizationAddress: [],
    shortName: 'Toyota',
  },
  id: 10,
  status: 'SUBMITTED',
};
const user = {
  organization: {
    id: 1,
    name: 'FCA Canada Inc.',
  },
};
const govUser = {
  organization: {
    id: 2,
    name: 'Government of B.C.',
  },
};

it('renders without crashing', () => {
  render(<Router><CreditTransfersDetailsPage submission={submission} user={user} handleSubmit={() => { console.log('submit!'); }} /></Router>);
});
it('shows an action bar with just a back button if the user is government', () => {
  const { container } = render(<CreditTransfersDetailsPage submission={submission} user={govUser} handleSubmit={() => { console.log('submit!'); }} />);
  expect(findByTestId(container, 'action-bar-basic')).toBeInTheDocument;
});
it('shows the comment box if the user is from the receiving supplier', () => {
  const { container } = render(<CreditTransfersDetailsPage submission={submission} user={user} handleSubmit={() => { console.log('submit!'); }} />);
  const commentbox = findByTestId(container, 'transfer-comment');
  expect(commentbox).toBeInTheDocument;
});
it('shows the submit modal if the user selects the submit button', () => {
  const { container } = render(<CreditTransfersDetailsPage submission={submission} user={user} handleSubmit={() => { console.log('submit!'); }} />);
  fireEvent.click(getByText(container, 'Submit Notice'));
  expect(queryByText(container, 'Submit transfer to government of B.C. Director?')).toBeInTheDocument;
  expect(queryByText(container, 'Reject notice?')).not.toBeInTheDocument;
});
it('shows the reject modal if the user selects the submit button', () => {
  const { container } = render(<CreditTransfersDetailsPage submission={submission} user={user} handleSubmit={() => { console.log('submit!'); }} />);
    fireEvent.click(getByText(container, 'Reject Notice'));
    expect(queryByText(container, 'Reject notice?')).toBeInTheDocument;
    expect(queryByText(container, 'Submit transfer to government of B.C. Director?')).not.toBeInTheDocument;

  });


it('does not show the commment box if the submission is already rejected', () => {
  submission.status = 'REJECTED';
  const { container } = render(<CreditTransfersDetailsPage submission={submission} user={user} handleSubmit={() => { console.log('submit!'); }} />);
  expect(findByTestId(container, 'transfer-comment')).not.toBeInTheDocument;
});
