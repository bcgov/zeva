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

const handleCheckboxClick = () => { console.log('click'); };
const submission = {
  history: [{
    status: 'SUBMITTED',
    createUser: {
      displayName: 'emily',
      organization: { name: 'Toyota Canada Inc.' },
    },
    createTimestamp: '2020-12-01T09:27:21.098202-07:00',
  }],
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
  hasPermission: () => (true),
  organization: {
    id: 61,
    name: 'FCA Canada Inc.',
  },
};

const user2 = {
  hasPermission: () => (true),
  organization: {
    id: 1,
    name: 'Toyota Canada Inc.',
  },
};
const govUser = {
  hasPermission: () => (true),
  organization: {
    id: 2,
    name: 'Government of B.C.',
  },
};

it('renders without crashing', () => {
  render(<Router><CreditTransfersDetailsPage checkboxes={[]} assertions={[]} submission={submission} user={user} handleSubmit={() => { console.log('submit!'); }} /></Router>);
});
it('shows an action bar with just a back button if the user is government', () => {
  const { container } = render(<CreditTransfersDetailsPage checkboxes={[]} submission={submission} assertions={[]} user={govUser} handleSubmit={() => { console.log('submit!'); }} />);
  expect(findByTestId(container, 'action-bar-basic')).toBeInTheDocument;
});
it('shows the comment box and reject button (but not rescind button) if the user is from the receiving supplier', () => {
  const { container } = render(<CreditTransfersDetailsPage checkboxes={[]} submission={submission} assertions={[]} user={user} handleSubmit={() => { console.log('submit!'); }} />);
  const commentbox = findByTestId(container, 'transfer-comment');
  expect(commentbox).toBeInTheDocument;
  expect(queryByText(container, 'Rescind')).not.toBeInTheDocument;
});

it('shows the reject modal if the user selects the reject button', () => {
  const { container } = render(<CreditTransfersDetailsPage submission={submission} checkboxes={[]} assertions={[]} user={user2} handleSubmit={() => { console.log('submit!'); }} />);
  fireEvent.click(getByText(container, 'Reject Notice'));
  expect(queryByText(container, 'Reject notice?')).toBeInTheDocument;
  expect(queryByText(container, 'Submit transfer to government of B.C. Director?')).not.toBeInTheDocument;
});
it('does not show the commment box if the submission is already rejected', () => {
  submission.status = 'REJECTED';
  const { container } = render(<CreditTransfersDetailsPage submission={submission} checkboxes={[]} assertions={[]} user={user} handleSubmit={() => { console.log('submit!'); }} />);
  expect(findByTestId(container, 'transfer-comment')).not.toBeInTheDocument;
});
it('if its a draft, initiating company can submit to partner or press back', () => {
  submission.status = 'DRAFT';
  const { container } = render(<CreditTransfersDetailsPage submission={submission} checkboxes={[]} assertions={[]} user={user} handleSubmit={() => { console.log('submit!'); }} />);
  fireEvent.click(getByTestId(container, 'submit-to-partner'));
  expect(queryByText(container, 'Submit credit transfer notice to trade partner?')).toBeInTheDocument;
});
it('shows the submit modal if the user selects the submit button', () => {
  submission.status = 'DRAFT';
  const { container } = render(<CreditTransfersDetailsPage submission={submission} checkboxes={[]} assertions={[]} user={user} handleSubmit={() => { console.log('submit!'); }} />);
  fireEvent.click(getByTestId(container, 'submit-to-partner'));
  expect(queryByText(container, 'Submit transfer to government of B.C. Director?')).toBeInTheDocument;
  expect(queryByText(container, 'Reject notice?')).not.toBeInTheDocument;
});
it('shows the submission and signed date if the transfer partner opens it', () => {
  submission.status = 'SUBMITTED';
  const { container } = render(<CreditTransfersDetailsPage submission={submission} checkboxes={[]} assertions={[]} user={user2} handleSubmit={() => { console.log('submit!'); }} />);

  expect(findByTestId(container, 'submit-signature')).toBeInTheDocument;
  expect(findByTestId(container, 'approve-signature')).not.toBeInTheDocument;
});
// do not show the rescind button if the user is partner and status is submitted
it('does not show the rescind button to the partner if the partner hasnt approved', () => {
  submission.status = 'SUBMITTED';
  const { container } = render(<CreditTransfersDetailsPage submission={submission} checkboxes={[]} assertions={[]} user={user2} handleSubmit={() => { console.log('submit!'); }} />);

  expect(queryByText(container, 'Rescind')).not.toBeInTheDocument;
  expect(queryByText(container, 'Reject')).toBeInTheDocument;
});
it('shows the submission and approved signature dates if status is approved', () => {
  submission.status = 'APPROVED';
  submission.history = [{
    status: 'SUBMITTED',
    createUser: {
      displayName: 'emily',
      organization: { name: 'Toyota Canada Inc.' },
    },
    createTimestamp: '2020-12-01T09:27:21.098202-07:00',
  },
  {
    status: 'APPROVED',
    createUser: {
      displayName: 'not Emily',
      organization: { name: 'FCA Canada Inc.' },
    },
    createTimestamp: '2020-12-02T09:27:21.098202-07:00',
  },
  ];
  const { container } = render(<CreditTransfersDetailsPage submission={submission} checkboxes={[]} assertions={[]} user={user} handleSubmit={() => { console.log('submit!'); }} />);

  expect(findByTestId(container, 'submit-signature')).toBeInTheDocument;
  expect(findByTestId(container, 'approve-signature')).toBeInTheDocument;
});
it('shows the comment box to the director if user is analyst', () => {
  const { container } = render(<CreditTransfersDetailsPage submission={submission} checkboxes={[]} assertions={[]} user={govUser} handleSubmit={() => { console.log('submit!'); }} />);
  const commentbox = findByTestId(container, 'transfer-comment-analyst');
  expect(commentbox).toBeInTheDocument;
  // fireEvent.click(getByText(container, 'Recommend transfer'));
  // expect(queryByText(container, 'Recommend the Director record the Transfer?')).toBeInTheDocument;
});

// show the rescind button if the user is bceid (initiator) and the status is approved, submitted, accepted

// show the rescind button if the user is partner and status is approved or accepted
