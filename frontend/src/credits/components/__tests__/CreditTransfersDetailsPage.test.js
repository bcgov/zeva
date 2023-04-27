import React from 'react'
import {
  render,
  fireEvent,
  queryByText,
  getByTestId,
  queryByTestId
} from '@testing-library/react'
import CreditTransfersDetailsPage from '../CreditTransfersDetailsPage'
import '@testing-library/jest-dom/extend-expect'
import { BrowserRouter as Router } from 'react-router-dom'

const submission = {
  history: [
    {
      status: 'DRAFT',
      createUser: {
        displayName: 'emily',
        organization: { name: 'Toyota Canada Inc.' }
      },
      createTimestamp: '2020-12-01T09:27:21.098202-07:00'
    },
    {
      status: 'SUBMITTED',
      createUser: {
        displayName: 'emily',
        organization: { name: 'Toyota Canada Inc.' }
      },
      createTimestamp: '2020-12-01T09:27:21.098202-07:00'
    }
  ],
  creditTo: {
    avgLdvSales: 5806,
    balance: { A: 0, B: 0 },
    createTimestamp: '2020-05-26T09:27:21.098202-07:00',
    id: 1,
    isActive: true,
    isGovernment: false,
    ldvSales: [
      {
        id: 248,
        ldvSales: 4736,
        modelYear: '2021'
      },
      {
        id: 139,
        ldvSales: 5280,
        modelYear: '2020'
      }
    ],
    name: 'FCA Canada Inc.',
    organizationAddress: [],
    shortName: null
  },
  creditTransferComment: null,
  creditTransferContent: [
    {
      creditValue: '100.00',
      dollarValue: '75.00',
      creditClass: { creditClass: 'A' },
      modelYear: { name: '2020' },
      weightClass: []
    },
    {
      creditValue: '110.00',
      dollarValue: '25.00',
      creditClass: { creditClass: 'A' },
      modelYear: { name: '2019' },
      weightClass: []
    },
    {
      creditValue: '5.00',
      dollarValue: '86.00',
      creditClass: { creditClass: 'A' },
      modelYear: { name: '2018' },
      weightClass: []
    },
    {
      creditValue: '30.00',
      dollarValue: '75.00',
      creditClass: { creditClass: 'A' },
      modelYear: { name: '2020' },
      weightClass: []
    }
  ],
  debitFrom: {
    avgLdvSales: 9275.3,
    balance: {
      A: 0,
      B: 40.55
    },
    createTimestamp: '2020-05-26T09:27:21.121946-07:00',
    id: 61,
    isActive: true,
    isGovernment: false,
    ldvSales: [
      {
        id: 248,
        ldvSales: 4736,
        modelYear: '2021'
      },
      {
        id: 139,
        ldvSales: 5280,
        modelYear: '2020'
      }
    ],
    name: 'Toyota Canada Inc.',
    organizationAddress: [],
    shortName: 'Toyota'
  },
  id: 10,
  status: 'SUBMITTED'
}

const user = {
  hasPermission: () => true,
  organization: {
    id: 61,
    name: 'FCA Canada Inc.'
  }
}

const user2 = {
  hasPermission: () => true,
  organization: {
    id: 1,
    name: 'Toyota Canada Inc.'
  }
}
const govUser = {
  hasPermission: () => true,
  organization: {
    id: 2,
    name: 'Government of B.C.'
  },
  isGovernment: true
}

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 10 })
}))

jest.mock('../../../app/components/Button', () => {
  const React = require('react')
  return jest.fn().mockImplementation(({ buttonType, action, optionalText, optionalClassname, locationRoute, buttonTooltip, disabled, ...props }) => {
    const buttonText = optionalText
    return (
      <button onClick={action} {...props}>
        {buttonText}
        {disabled}
      </button>
    )
  })
})

const RenderCreditTransfersDetailsPage = (user) => {
  return (
    <>
      <CreditTransfersDetailsPage
        checkboxes={[]}
        submission={submission}
        assertions={[]}
        user={user}
        sufficientCredit={true}
        handleCheckboxClick={() => {}}
        handleSubmit={() => {
          console.log('submit!')
        }}
        errorMessage={[]}
      />
    </>
  )
}

it('renders without crashing', () => {
  render(<Router>{RenderCreditTransfersDetailsPage(user)}</Router>)
})

it('renders without crashing', () => {
  render(<Router>{RenderCreditTransfersDetailsPage(user2)}</Router>)
})

it('shows an action bar with just a back button if the user is government', () => {
  const { container } = render(RenderCreditTransfersDetailsPage(govUser))
  expect(getByTestId(container, 'back-to')).toBeInTheDocument()
})

it('shows the comment box and reject button (but not rescind button) if the user is from the receiving supplier', () => {
  const { container } = render(RenderCreditTransfersDetailsPage(user2))
  const commentbox = getByTestId(container, 'transfer-comment')
  expect(commentbox).toBeInTheDocument()
  expect(queryByText(container, 'Rescind')).not.toBeInTheDocument()
})

it('shows the reject modal if the user selects the reject button', () => {
  const { container } = render(RenderCreditTransfersDetailsPage(user2))
  fireEvent.click(getByTestId(container, 'reject-transfer'))
  expect(queryByText(container, 'Reject notice?')).toBeInTheDocument()
  expect(
    queryByText(container, 'Submit transfer to government of B.C. Director?')
  ).not.toBeInTheDocument()
})

it('if its a draft, initiating company can submit to partner or press back', () => {
  submission.status = 'DRAFT'
  submission.history = [
    {
      status: 'DRAFT',
      createUser: {
        displayName: 'emily',
        organization: { name: 'Toyota Canada Inc.' }
      },
      createTimestamp: '2020-12-01T09:27:21.098202-07:00'
    }
  ]
  const { container } = render(RenderCreditTransfersDetailsPage(user))
  fireEvent.click(getByTestId(container, 'submit-to-partner'))
  expect(
    queryByText(container, 'Submit credit transfer notice to trade partner?')
  ).toBeInTheDocument()
})

it('shows the submit modal if the user selects the submit button', () => {
  submission.status = 'SUBMITTED'
  submission.history = [
    {
      status: 'SUBMITTED',
      createUser: {
        displayName: 'emily',
        organization: { name: 'Toyota Canada Inc.' }
      },
      createTimestamp: '2020-12-01T09:27:21.098202-07:00'
    }
  ]
  const { container } = render(RenderCreditTransfersDetailsPage(user2))
  fireEvent.click(getByTestId(container, 'submit-to-gov'))
  expect(
    queryByText(container, 'Submit transfer to government of B.C. Director?')
  ).toBeInTheDocument()
  expect(queryByText(container, 'Reject notice?')).not.toBeInTheDocument()
})
it('shows the submission and signed date if the transfer partner opens it', () => {
  submission.status = 'SUBMITTED'
  submission.history = [
    {
      status: 'SUBMITTED',
      createUser: {
        displayName: 'emily',
        organization: { name: 'Toyota Canada Inc.' }
      },
      createTimestamp: '2020-12-01T09:27:21.098202-07:00'
    }
  ]
  const { container } = render(RenderCreditTransfersDetailsPage(user2))
  expect(getByTestId(container, 'submit-signature')).toBeInTheDocument()
  expect(queryByTestId(container, 'approve-signature')).not.toBeInTheDocument()
})
// // do not show the rescind button if the user is partner and status is submitted
it('does not show the rescind button to the partner if the partner hasnt approved', () => {
  submission.status = 'SUBMITTED'
  const { container } = render(RenderCreditTransfersDetailsPage(user2))
  expect(queryByText(container, 'Rescind')).not.toBeInTheDocument()
  expect(queryByText(container, 'Reject Notice')).toBeInTheDocument()
})
it('shows the submission and approved signature dates if status is approved', () => {
  submission.status = 'APPROVED'
  submission.history = [
    {
      status: 'SUBMITTED',
      createUser: {
        displayName: 'emily',
        organization: { name: 'Toyota Canada Inc.' }
      },
      createTimestamp: '2020-12-01T09:27:21.098202-07:00'
    },
    {
      status: 'APPROVED',
      createUser: {
        displayName: 'not Emily',
        organization: { name: 'FCA Canada Inc.' }
      },
      createTimestamp: '2020-12-02T09:27:21.098202-07:00'
    }
  ]
  const { container } = render(RenderCreditTransfersDetailsPage(user))
  expect(getByTestId(container, 'submit-signature')).toBeInTheDocument()
  expect(getByTestId(container, 'approve-signature')).toBeInTheDocument()
})
it('shows the comment box to the director if user is analyst', () => {
  submission.status = 'RECOMMEND_REJECTION'
  submission.history = [
    {
      status: 'RECOMMEND_REJECTION',
      createUser: {
        displayName: 'emily',
        organization: { name: 'Toyota Canada Inc.' }
      },
      createTimestamp: '2020-12-01T09:27:21.098202-07:00'
    },
    {
      status: 'SUBMITTED',
      createUser: {
        displayName: 'emily',
        organization: { name: 'Toyota Canada Inc.' }
      },
      createTimestamp: '2020-12-01T09:27:21.098202-07:00'
    }
  ]
  const { container } = render(RenderCreditTransfersDetailsPage(govUser))
  const commentbox = getByTestId(container, 'transfer-comment-analyst')
  expect(commentbox).toBeInTheDocument()
  // fireEvent.click(getByText(container, 'Recommend transfer'));
  // expect(queryByText(container, 'Recommend the Director record the Transfer?')).toBeInTheDocument;
})
it('does not show the commment box if the submission is already rejected', () => {
  submission.status = 'REJECTED'
  submission.history = [
    {
      status: 'SUBMITTED',
      createUser: {
        displayName: 'emily',
        organization: { name: 'Toyota Canada Inc.' }
      },
      createTimestamp: '2020-12-01T09:27:21.098202-07:00'
    },
    {
      status: 'REJECTED',
      createUser: {
        displayName: 'emily',
        organization: { name: 'Toyota Canada Inc.' }
      },
      createTimestamp: '2020-12-10T09:27:21.098202-07:00'
    }
  ]
  const { container } = render(RenderCreditTransfersDetailsPage(user))
  expect(queryByTestId(container, 'transfer-comment')).not.toBeInTheDocument()
})

// show the rescind button if the user is bceid (initiator) and the status is approved, submitted, accepted

// show the rescind button if the user is partner and status is approved or accepted
