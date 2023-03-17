import React from 'react'
import { describe, expect, test } from '@jest/globals'
import { render } from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom'
import SupplementarySupplierDetails from '../SupplementarySupplierDetails'

const emptyFunction = () => {}

const details = {
  assessmentData: {
    makes: ['make1', 'make2'],
    modelYear: '2021',
    reassessment: true,
    actualStatus: 'DRAFT',
    legalName: 'test company',
    supplierClass: 'L',
    zevSales: [{
      id: 15,
      pendingSales: 0,
      make: 'make1',
      modelName: 'model1',
      range: '420.00',
      salesIssued: 35,
      vehicleZevType: 'BEV',
      zevClass: 'A'
    }],
    reportAddress: [{
      representativeName: 'test name',
      addressLine1: 'test road',
      addressType: { addressType: 'Service' },
      city: 'Victoria',
      country: 'Canada',
      county: null,
      id: 123,
      postalCode: 'V8Z 4K8',
      state: 'BC'
    }]
  }
}

const supplementaryAssessmentData = {
  supplementaryAssessment: {
    penalty: 0,
    decision: { description: '{user.organization.name} has not complied.', id: 3 },
    inCompliance: false
  }
}

const user = {
  hasPermission: () => {}
}

const baseProps = {
  addSalesRow: emptyFunction,
  checkboxConfirmed: false,
  commentArray: {},
  deleteFiles: [],
  details,
  files: [],
  handleCheckboxClick: emptyFunction,
  handleCommentChange: emptyFunction,
  handleCommentChangeBceid: emptyFunction,
  handleInputChange: emptyFunction,
  handleSubmit: emptyFunction,
  handleSupplementalChange: emptyFunction,
  id: 1,
  isReassessment: false,
  ldvSales: 0,
  loading: false,
  newBalances: {},
  newData: {},
  obligationDetails: [],
  query: {},
  ratios: {},
  salesRows: [],
  setDeleteFiles: emptyFunction,
  setSupplementaryAssessmentData: emptyFunction,
  setUploadFiles: emptyFunction,
  supplementaryAssessmentData,
  user
}

jest.mock('../SupplierInformation', () => {
  const SupplierInformationMock = () => <div>SupplierInformationMock</div>
  return SupplierInformationMock
})
jest.mock('../ZevSales', () => {
  const ZevSalesMock = () => <div>ZevSalesMock</div>
  return ZevSalesMock
})
jest.mock('../CreditActivity', () => {
  const CreditActivityMock = () => <div>CreditActivityMock</div>
  return CreditActivityMock
})

jest.mock('../../../app/components/CommentInput', () => {
  const CommentInputMock = () => <div>CommentInputMock</div>
  return CommentInputMock
})

jest.mock('../UploadEvidence', () => {
  const UploadEvidenceMock = () => <div>UploadEvidenceMock</div>
  return UploadEvidenceMock
})

const mockSupplementaryTab = jest.fn()
jest.mock('../SupplementaryTab', () => {
  const SupplementaryTabMock = (props) => {
    mockSupplementaryTab(props)
    return <div>SupplementaryTabMock</div>
  }
  return SupplementaryTabMock
})

afterEach(() => {
  mockSupplementaryTab.mockClear()
})

describe('SupplementarySupplierDetails', () => {
  test('renders without crashing', () => {
    render(
      <Router>
        <SupplementarySupplierDetails
          {...baseProps}
        />
      </Router>
    )
  })

  test('correct tabs are rendered, when given a supplementaryReportId', () => {
    const props = { ...baseProps, supplementaryReportId: 1 }
    const { queryAllByText } = render(
      <Router>
        <SupplementarySupplierDetails
          {...props}
        />
      </Router>
    )
    expect(mockSupplementaryTab).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Supplementary Report'
      })
    )
    expect(mockSupplementaryTab).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Reassessment'
      })
    )
    expect(queryAllByText('SupplementaryTabMock')).toHaveLength(2)
  })

  test('correct tabs are rendered, when not given a supplementaryReportId', () => {
    const { queryAllByText } = render(
      <Router>
        <SupplementarySupplierDetails
          {...baseProps}
        />
      </Router>
    )
    expect(mockSupplementaryTab).not.toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Supplementary Report'
      })
    )
    expect(mockSupplementaryTab).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Reassessment'
      })
    )
    expect(queryAllByText('SupplementaryTabMock')).toHaveLength(1)
  })

  test('certain child components rendered based on currentStatus of DRAFT', () => {
    const props = { ...baseProps, details: { ...details, actualStatus: 'DRAFT' } }
    const { queryAllByText } = render(
      <Router>
        <SupplementarySupplierDetails
          {...props}
        />
      </Router>
    )
    expect(queryAllByText('SupplierInformationMock')).toHaveLength(1)
    expect(queryAllByText('ZevSalesMock')).toHaveLength(1)
    expect(queryAllByText('CreditActivityMock')).toHaveLength(1)
    expect(queryAllByText('CommentInputMock')).toHaveLength(1)
    expect(queryAllByText('UploadEvidenceMock')).toHaveLength(1)
  })

  // todo: tests that test whether certain child components render based on other currentStatuses (SUBMITTED, RECOMMENDED, etc.)

  test('confirmation checkbox renders when user has the SUBMIT_COMPLIANCE_REPORT permission', () => {
    const f = (permission) => {
      const permissions = ['SUBMIT_COMPLIANCE_REPORT']
      if (permissions.indexOf(permission) > -1) {
        return true
      }
    }
    const props = { ...baseProps, details: { ...details, actualStatus: 'DRAFT' }, user: { hasPermission: f } }
    const { queryAllByTestId } = render(
      <Router>
        <SupplementarySupplierDetails
          {...props}
        />
      </Router>
    )
    expect(queryAllByTestId('supplier-confirm-checkbox')).toHaveLength(1)
  })

  test('confirmation checkbox does not render when user does not have the SUBMIT_COMPLIANCE_REPORT permission', () => {
    const f = (permission) => {
      const permissions = []
      if (permissions.indexOf(permission) > -1) {
        return true
      }
    }
    const props = { ...baseProps, details: { ...details, actualStatus: 'DRAFT' }, user: { hasPermission: f } }
    const { queryAllByTestId } = render(
      <Router>
        <SupplementarySupplierDetails
          {...props}
        />
      </Router>
    )
    expect(queryAllByTestId('supplier-confirm-checkbox')).toHaveLength(0)
  })
})
