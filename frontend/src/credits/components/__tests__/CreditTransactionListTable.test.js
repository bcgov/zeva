import React from 'react'
import { render } from '@testing-library/react'
import CreditTransactionListTable from '../CreditTransactionListTable'
import '@testing-library/jest-dom/extend-expect'
import { BrowserRouter as Router } from 'react-router-dom'

const data = [
  {
    creditClass: { creditClass: 'A' },
    detailTransactionType: null,
    foreignKey: 159,
    modelYear: {
      name: '2020',
      effectiveDate: '2019-01-01',
      expirationDate: '2019-12-31'
    },
    totalValue: 10.1417,
    transactionTimestamp: '2021-08-31T10:54:43.299000-07:00',
    transactionType: { transactionType: 'Validation' }
  },
  {
    creditClass: { creditClass: 'A' },
    detailTransactionType: null,
    foreignKey: 218,
    modelYear: {
      name: '2020',
      effectiveDate: '2020-01-01',
      expirationDate: '2020-12-31'
    },
    totalValue: 48,
    transactionTimestamp: '2022-02-25T10:21:11.207083-08:00',
    transactionType: { transactionType: 'Validation' }
  }
]

const reports = [
  {
    compliant: 'Yes',
    id: 191,
    ldvSales: 5000,
    modelYear: {
      name: '2020',
      effectiveDate: '2020-01-01',
      expirationDate: '2020-12-31'
    },
    effectiveDate: '2020-01-01',
    expirationDate: '2020-12-31',
    name: '2020',
    obligationCredits: 0,
    obligationTotal: 0,
    organizationName: 'Tesla Motors Canada ULC',
    supplementalId: null,
    supplementalStatus: 'ASSESSED',
    supplierClass: 'L',
    validationStatus: 'ASSESSED'
  }
]

it('renders without crashing', () => {
  render(
    <Router>
      <CreditTransactionListTable items={data} reports={reports} />
    </Router>
  )
})

it('rounds the credit balance correctly', () => {
  const { getAllByText } = render(
    <Router>
      <CreditTransactionListTable items={data} reports={reports} />
    </Router>
  )
  const totalValue = getAllByText(/10\.14/)
  expect(totalValue).toHaveLength(2)
  totalValue.forEach((value) => {
    expect(value).toBeInTheDocument()
  })
})
