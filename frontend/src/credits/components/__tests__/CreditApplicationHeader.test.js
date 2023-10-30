import React from 'react'
import { describe, expect, test } from '@jest/globals'
import { render } from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom'
import CreditApplicationHeader from '../CreditApplicationHeader'

const baseSubmission = {
  organization: {
    organizationAddress: []
  },
  evidence: []
}

const baseProps = {
  submission: baseSubmission,
  user: {}
}

describe('CreditApplicationHeader', () => {
  test('renders without crashing', () => {
    render(
      <Router>
        <CreditApplicationHeader
          {...baseProps}
        />
      </Router>
    )
  })

  test('renders service address', () => {
    const testServiceAddress = 'testServiceAddress'
    const organization = {
      organizationAddress: [{
        addressType: {
          addressType: 'Service'
        },
        addressLine1: 'testServiceAddress'
      }]
    }
    const submission = { ...baseSubmission, organization }
    const props = { ...baseProps, submission }
    const { queryAllByText } = render(
      <Router>
        <CreditApplicationHeader
          {...props}
        />
      </Router>
    )
    expect(queryAllByText(testServiceAddress)).toHaveLength(1)
  })

  test('renders records address', () => {
    const testRecordAddress = 'testRecordsAddress'
    const organization = {
      organizationAddress: [{
        addressType: {
          addressType: 'Records'
        },
        addressLine1: testRecordAddress
      }]
    }
    const submission = { ...baseSubmission, organization }
    const props = { ...baseProps, submission }
    const { queryAllByText } = render(
      <Router>
        <CreditApplicationHeader
          {...props}
        />
      </Router>
    )
    expect(queryAllByText(testRecordAddress)).toHaveLength(1)
  })

  test('renders evidence buttons', () => {
    const testFilename = 'testFilename'
    const evidence = [{
      id: 1,
      filename: testFilename
    }]
    const submission = { ...baseSubmission, evidence }
    const props = { ...baseProps, submission }
    const { queryAllByText } = render(
      <Router>
        <CreditApplicationHeader
          {...props}
        />
      </Router>
    )
    expect(queryAllByText(testFilename)).toHaveLength(1)
  })
})
