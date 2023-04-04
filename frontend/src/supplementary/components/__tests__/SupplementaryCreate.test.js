import React from 'react'
import { render } from '@testing-library/react'
import SupplementaryCreate from '../SupplementaryCreate'
import '@testing-library/jest-dom/extend-expect'
import { BrowserRouter as Router } from 'react-router-dom'
import CONFIG from '../../../app/config'

const emptyFunction = () => {}

const baseDetails = {}

const baseUser = {
  hasPermission: () => {}
}

const baseProps = {
  addSalesRow: emptyFunction,
  checkboxConfirmed: false,
  deleteFiles: [{}],
  details: baseDetails,
  files: [{}],
  handleCheckboxClick: emptyFunction,
  handleCommentChange: emptyFunction,
  handleInputChange: emptyFunction,
  handleSubmit: emptyFunction,
  handleSupplementalChange: emptyFunction,
  id: 1,
  isReassessment: false,
  ldvSales: 1000,
  loading: false,
  newBalances: {},
  newData: {},
  obligationDetails: [{}],
  query: {},
  ratios: {},
  salesRows: [{}],
  setDeleteFiles: emptyFunction,
  setUploadFiles: emptyFunction,
  supplementaryAssessmentData: {},
  user: baseUser
}

const mockSupplierInformationPropsTracker = jest.fn()
jest.mock('../SupplierInformation', () => {
  const SupplierInformationMock = (props) => {
    mockSupplierInformationPropsTracker(props)
    return <div>SupplierInformationMock</div>
  }
  return SupplierInformationMock
})

const mockZevSalesPropsTracker = jest.fn()
jest.mock('../ZevSales', () => {
  const ZevSalesMock = (props) => {
    mockZevSalesPropsTracker(props)
    return <div>ZevSalesMock</div>
  }
  return ZevSalesMock
})

const mockCreditActivityPropsTracker = jest.fn()
jest.mock('../CreditActivity', () => {
  const CreditActivityMock = (props) => {
    mockCreditActivityPropsTracker(props)
    return <div>CreditActivityMock</div>
  }
  return CreditActivityMock
})

const mockCommentInputPropsTracker = jest.fn()
jest.mock('../../../app/components/CommentInput', () => {
  const CommentInputMock = (props) => {
    mockCommentInputPropsTracker(props)
    return <div>CommentInputMock</div>
  }
  return CommentInputMock
})

jest.mock('../UploadEvidence', () => {
  const UploadEvidenceMock = () => <div>UploadEvidenceMock</div>
  return UploadEvidenceMock
})

afterEach(() => {
  mockSupplierInformationPropsTracker.mockClear()
  mockZevSalesPropsTracker.mockClear()
  mockCreditActivityPropsTracker.mockClear()
  mockCommentInputPropsTracker.mockClear()
  jest.restoreAllMocks()
})

describe('SupplementaryCreate', () => {
  test('renders without crashing', () => {
    render(
      <Router>
        <SupplementaryCreate
          {...baseProps}
        />
      </Router>
    )
  })

  test('comments are rendered correctly', () => {
    const comment = { comment: 'test comment' }
    const details = { ...baseDetails, fromSupplierComments: [comment] }
    const props = { ...baseProps, details }
    const { queryAllByText } = render(
      <Router>
        <SupplementaryCreate
          {...props}
        />
      </Router>
    )
    expect(queryAllByText('CommentInputMock')).toHaveLength(1)
    expect(mockCommentInputPropsTracker).toHaveBeenCalledWith(
      expect.objectContaining({
        defaultComment: comment
      })
    )
  })

  describe('checkboxConfirmed renders only with the correct permissions', () => {
    const submitPermission = 'SUBMIT_COMPLIANCE_REPORT'
    const permissionCollections = [[submitPermission], []]
    permissionCollections.forEach((permissionCollection) => {
      const user = {
        ...baseUser,
        hasPermission: (permission) => {
          if (permissionCollection.indexOf(permission) > -1) {
            return true
          }
          return false
        }
      }
      const props = { ...baseProps, user }
      test(`checkbox does${permissionCollection.indexOf(submitPermission) > -1 ? ' ' : ' not '}render given permission(s): ${permissionCollection.length > 0 ? permissionCollection : '[]'}`, () => {
        const { queryAllByTestId } = render(
          <Router>
            <SupplementaryCreate
              {...props}
            />
          </Router>
        )
        if (permissionCollection.indexOf(submitPermission) > -1) {
          expect(queryAllByTestId('supplier-confirm-checkbox')).toHaveLength(1)
        } else {
          expect(queryAllByTestId('supplier-confirm-checkbox')).toHaveLength(0)
        }
      })
    })
  })

  describe('submit button renders/does not render based on feature flag', () => {
    [true, false].forEach((supplementalReportEnabled) => {
      test(`submit button ${supplementalReportEnabled ? 'renders' : 'does not render'} when feature flag is ${supplementalReportEnabled ? 'enabled' : 'disabled'}`, () => {
        jest.replaceProperty(CONFIG.FEATURES.SUPPLEMENTAL_REPORT, 'ENABLED', supplementalReportEnabled)
        const { queryAllByTestId } = render(
          <Router>
            <SupplementaryCreate
              {...baseProps}
            />
          </Router>
        )
        if (supplementalReportEnabled) {
          expect(queryAllByTestId('supplementary-create-button')).toHaveLength(1)
        } else {
          expect(queryAllByTestId('supplementary-create-button')).toHaveLength(0)
        }
      })
    })
  })
})
