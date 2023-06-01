import React from 'react'
import { describe, expect, test } from '@jest/globals'
import { render, act, screen } from '@testing-library/react'
import SupplementaryContainer from '../SupplementaryContainer'
import * as ReactRouter from 'react-router-dom'
import axios from 'axios'
import ROUTES_SUPPLEMENTARY from '../../app/routes/SupplementaryReport'
import ROUTES_COMPLIANCE from '../../app/routes/Compliance'

const Router = ReactRouter.BrowserRouter

// please do not directly modify any of the consts declared outside of the outermost 'describe' block
// you can, in your individual tests, copy them (the spread operator) and modify the copy

const baseParams = {
  id: 1,
  supplementaryId: null
}

const baseLocation = {
  pathname: '/',
  search: '?'
}

const baseUser = {
  hasPermission: () => {}
}

const baseProps = {
  keycloak: {},
  user: baseUser
}

const supplementaryDetails = {
  assessmentData: {
    zevSales: []
  },
  supplierInformation: [],
  zevSales: [],
  creditActivity: []
}

const assessedSupplementals = []

const complianceDetails = {}

const ratios = []

const assessment = {}

const baseData = {
  supplementaryDetails,
  assessedSupplementals,
  complianceDetails,
  ratios,
  assessment
}

jest.mock('../components/SupplementaryCreate', () => {
  const SupplementaryCreateMock = () => <div>SupplementaryCreateMock</div>
  return SupplementaryCreateMock
})

jest.mock('../components/SupplementarySupplierDetails', () => {
  const SupplementarySupplierDetailsMock = () => <div>SupplementarySupplierDetailsMock</div>
  return SupplementarySupplierDetailsMock
})

jest.mock('../components/SupplementaryDirectorDetails', () => {
  const SupplementaryDirectorDetailsMock = () => <div>SupplementaryDirectorDetailsMock</div>
  return SupplementaryDirectorDetailsMock
})

jest.mock('../components/SupplementaryAnalystDetails', () => {
  const SupplementaryAnalystDetailsMock = () => <div>SupplementaryAnalystDetailsMock</div>
  return SupplementaryAnalystDetailsMock
})

jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom')
  return {
    __esModule: true,
    ...originalModule
  }
})

// explicitly mock axios here instead of using the mock provided by jest-mock-axios,
// as that mock does not have the axios.spread function, which is used by SupplementaryContainer
jest.mock('axios', () => {
  const originalModule = jest.requireActual('axios')
  return {
    __esModule: true,
    ...originalModule
  }
})

const getDataByUrl = (url, data, id, supplementaryId) => {
  if (url === `${ROUTES_SUPPLEMENTARY.DETAILS.replace(':id', id)}?supplemental_id=${supplementaryId || ''}`) {
    return data.supplementaryDetails
  } else if (url === ROUTES_SUPPLEMENTARY.ASSESSED_SUPPLEMENTALS.replace(':id', id)) {
    return data.assessedSupplementals
  } else if (url === ROUTES_COMPLIANCE.REPORT_COMPLIANCE_DETAILS_BY_ID.replace(':id', id)) {
    return data.complianceDetails
  } else if (url === ROUTES_COMPLIANCE.RATIOS) {
    return data.ratios
  } else if (url === `${ROUTES_SUPPLEMENTARY.ASSESSMENT.replace(':id', id)}?supplemental_id=${supplementaryId || ''}`) {
    return data.assessment
  }
}

beforeEach(() => {
  // mock the useParams() and useLocation() hooks
  // can override this in an individual test by using jest.spyOn() and passing in a new input (param or location)
  jest.spyOn(ReactRouter, 'useParams').mockReturnValue(baseParams)
  jest.spyOn(ReactRouter, 'useLocation').mockReturnValue(baseLocation)
  // mock the data returned in refreshDetails()
  // can override this in an individual test by using jest.spyOn() and passing in new inputs (data, id, supplementaryId)
  jest.spyOn(axios, 'get').mockImplementation((url) => {
    return Promise.resolve({ data: getDataByUrl(url, baseData, baseParams.id, baseParams.supplementaryId) })
  })
})

describe('SupplementaryContainer', () => {
  test('renders without crashing', async () => {
    await act(async () => {
      render(
        <Router>
          <SupplementaryContainer
            {...baseProps}
          />
        </Router>
      )
    })
  })

  test('renders create report view', async () => {
    const props = { ...baseProps, newReport: true }
    await act(async () => {
      render(
        <Router>
          <SupplementaryContainer
            {...props}
          />
        </Router>
      )
    })
    const supplementaryCreate = screen.queryAllByText('SupplementaryCreateMock')
    expect(supplementaryCreate).toHaveLength(1)
  })

  test('renders supplier view', async () => {
    const props = { ...baseProps, user: { ...baseUser, isGovernment: false } }
    await act(async () => {
      render(
        <Router>
          <SupplementaryContainer
            {...props}
          />
        </Router>
      )
    })
    const supplierDetails = screen.queryAllByText('SupplementarySupplierDetailsMock')
    expect(supplierDetails).toHaveLength(1)
  })

  test('renders director view', async () => {
    const props = { ...baseProps, user: { ...baseUser, isGovernment: true, roles: [{ roleCode: 'Director' }] } }
    await act(async () => {
      render(
        <Router>
          <SupplementaryContainer
            {...props}
          />
        </Router>
      )
    })
    const directorDetails = screen.queryAllByText('SupplementaryDirectorDetailsMock')
    expect(directorDetails).toHaveLength(1)
  })

  test('renders analyst view', async () => {
    const props = { ...baseProps, user: { ...baseUser, isGovernment: true, roles: [] } }
    await act(async () => {
      render(
        <Router>
          <SupplementaryContainer
            {...props}
          />
        </Router>
      )
    })
    const analystDetails = screen.queryAllByText('SupplementaryAnalystDetailsMock')
    expect(analystDetails).toHaveLength(1)
  })
})
