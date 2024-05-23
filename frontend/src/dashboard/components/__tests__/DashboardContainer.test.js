import React from 'react'
import { describe, expect, test, beforeEach, jest } from '@jest/globals'
import { render, screen, act } from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom'
import axios from 'axios'
import DashboardContainer from '../../DashboardContainer'
import '@testing-library/jest-dom/extend-expect'

jest.mock('axios')

const mockUser = {
  hasPermission: jest.fn(),
  isGovernment: false,
  organization: {
    name: 'Test Organization',
    organizationAddress: [
      {
        id: 1,
        addressType: {
          addressType: 'Records'
        },
        addressLine1: '123 Main St',
        addressLine2: 'Suite 100',
        city: 'Test City',
        state: 'TS',
        zip: '12345'
      }
    ]
  }
}

describe('DashboardContainer', () => {
  beforeEach(() => {
    axios.get.mockClear()
  })

  test('renders without crashing', () => {
    render(
      <Router>
        <DashboardContainer user={mockUser}/>
      </Router>
    )
  })

  test('fetches and sets dashboard data', async () => {
    const mockData = {
      data: [
        {
          activity: {
            vehicle: [
              { status: 'VALIDATED', total: 10 },
              { status: 'REJECTED', total: 5 },
              { status: 'DRAFT', total: 2 },
              { status: 'SUBMITTED', total: 8 },
              { status: 'CHANGES_REQUESTED', total: 1 }
            ],
            creditTransfer: [
              { status: 'SUBMITTED', total: 4 },
              { status: 'APPROVED', total: 3 },
              { status: 'VALIDATED', total: 6 },
              { status: 'REJECTED', total: 1 },
              { status: 'DISAPPROVED', total: 1 }
            ],
            modelYearReport: [
              { status: 'DRAFT', total: 2 },
              { status: 'SUBMITTED', total: 3 },
              { status: 'ASSESSED', total: 1 }
            ],
            creditRequest: [
              { status: 'DRAFT', total: 2 },
              { status: 'SUBMITTED', total: 4 },
              { status: 'VALIDATED', total: 3 }
            ],
            creditAgreement: [
              { status: 'ISSUED', total: 2 },
              { status: 'DRAFT', total: 1 },
              { status: 'RETURNED', total: 1 },
              { status: 'RECOMMENDED', total: 1 }
            ]
          }
        }
      ]
    }

    axios.get.mockResolvedValueOnce(mockData)

    mockUser.hasPermission.mockImplementation((permission) => {
      if (permission === 'VIEW_ZEV') {
        return true
      }
      return false
    })

    await act(async () => {
      render(
        <Router>
          <DashboardContainer user={mockUser} />
        </Router>
      )
    })
    
    await screen.findByText('Test Organization')
    
    const validatedModelsElement = await screen.findByText((content, element) => {
      return content.includes('10 validated by Government of B.C.')
    })
    expect(validatedModelsElement).toBeTruthy()

    const rejectedModelsElement = await screen.findByText((content, element) => {
      return content.includes('5 rejected by Government of B.C.')
    })
    expect(rejectedModelsElement).toBeTruthy()

    const draftModelsElement = await screen.findByText((content, element) => {
      return content.includes('2 saved in draft')
    })

    expect(draftModelsElement).toBeTruthy()

    const submittedModelsElement = await screen.findByText((content, element) => {
      return content.includes('8 awaiting validation')
    })
    expect(submittedModelsElement).toBeTruthy()

  })

  test('does not display loading indicator when finished fetching data', async () => {
    const mockData = {
      data: [
        {
          activity: {
            vehicle: [],
            creditTransfer: [],
            modelYearReport: [],
            creditRequest: [],
            creditAgreement: []
          }
        }
      ]
    }

    axios.get.mockResolvedValueOnce(mockData)

    await act(async () => {
      render(
        <Router>
          <DashboardContainer user={mockUser} />
        </Router>
      )
    })

    expect(await screen.queryByText('Loading...')).not.toBeInTheDocument()
  })
})
