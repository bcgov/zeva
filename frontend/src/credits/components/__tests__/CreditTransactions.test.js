import React from 'react'
import { render } from '@testing-library/react'
import CreditTransactions from '../CreditTransactions'
import '@testing-library/jest-dom/extend-expect'
import { BrowserRouter as Router } from 'react-router-dom'

const data = [
  {
    creditValue: '30.00',
    creditTo: {
      id: 1,
      name: 'Government of British Columbia',
      organizationAddress: null,
      createTimestamp: '2020-02-12T10:07:35.768433-08:00'
    },
    balance: { A: -60, B: -50 },
    debitFrom: {
      id: 3,
      name: 'BMW Canada Inc.',
      organizationAddress: null,
      createTimestamp: '2020-02-12T10:08:09.566993-08:00',
      balance: { A: 80, B: 60 }
    },
    transactionTimestamp: '2020-01-01T00:00:00-08:00',
    creditClass: { creditClass: 'A' },
    transactionType: { transactionType: 'Validation' },
    id: 4
  }
]

const balances = [
  {
    creditValue: '37.82',
    creditClass: { creditClass: 'A' },
    modelYear: {
      name: '2019',
      effectiveDate: '2019-01-01',
      expirationDate: '2019-12-31'
    },
    weightClass: {
      id: 1,
      weightClassCode: 'LDV',
      description: 'Light Duty Vehicle'
    }
  }
]

const assessedBalances = {}

const availableComplianceYears = []

const user = {
  organization: {
    balance: {
      A: 0,
      B: 0
    }
  }
}

it('renders without crashing', () => {
  render(
    <Router>
      <CreditTransactions items={data} user={user} balances={balances} assessedBalances={assessedBalances} reports={[]} availableComplianceYears={availableComplianceYears} />
    </Router>
  )
})
