import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import SupplementaryAnalystDetails from '../SupplementaryAnalystDetails'
import '@testing-library/jest-dom/extend-expect'
import { BrowserRouter as Router } from 'react-router-dom'
import CONFIG from '../../../app/config'

const testFunction = () => {}
const commentArray = {
  bdeidComment: [],
  idirComment: [{
    id: 1,
    comment: 'test comment',
    toDirector: false,
    createTimestamp: '2023-02-22T15:11:44.183236-08:00',
    createUser: {
      displayName: 'Emily Gov Analyst',
      email: 'email@gov.bc.ca',
      firstName: 'Emily',
      id: 2,
      isActive: true,
      isMapped: true,
      lastName: 'Test',
      phone: null
    }
  }]
}
const baseDetails = {
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
    }],
    creditReductionSelection: 'A'
  },
  actualStatus: 'DRAFT'
}
const newData = {}
const radioDescriptions = [{
  description: '{user.organization.name} has complied with section 10 (2) of the Zero-Emission Vehicles Act for the {modelYear} model year.',
  displayOrder: 0,
  id: 1
}, {
  description: '{user.organization.name} has not complied with section 10 (2).',
  displayOrder: 1,
  id: 2
}, {
  description: '{user.organization.name} has not complied.',
  displayOrder: 2,
  id: 3
}]
const salesRows = [
  { newData: {}, oldData: { creditAValue: '2000.00', creditBValue: '100.00', modelYear: '2021', category: 'ProvisionalBalanceAfterCreditReduction' } },
  { newData: {}, oldData: { creditAValue: '2700.00', creditBValue: '100.00', modelYear: '2021', category: 'creditsIssuedSales' } },
  { newData: {}, oldData: { creditAValue: '10.00', creditBValue: '10.00', modelYear: '2021', category: 'creditBalanceStart' } }
]

const baseObligationDetails = [
  {
    creditClass: { creditClass: 'A' },
    detailTransactionType: null,
    foreignKey: 159,
    modelYear: {
      name: '2021',
      effectiveDate: '2019-01-01',
      expirationDate: '2019-12-31'
    },
    totalValue: 10.1417,
    transactionTimestamp: '2021-08-31T10:54:43.299000-07:00',
    transactionType: { transactionType: 'Validation' }
  }
]

const baseUser = {
  isGovernment: true
}

const baseProps = {
  addSalesRow: testFunction,
  commentArray,
  deleteFiles: [{}],
  details: baseDetails,
  handleAddIdirComment: testFunction,
  handleCommentChangeBceid: testFunction,
  handleCommentChangeIdir: testFunction,
  handleDeleteIdirComment: testFunction,
  handleEditIdirComment: testFunction,
  handleInputChange: testFunction,
  handleSubmit: testFunction,
  handleSupplementalChange: testFunction,
  id: 1,
  loading: false,
  ldvSales: 1000,
  newData,
  newBalances: {},
  ratios: {
    complianceRatio: 12.00,
    modelYear: '2021',
    id: 1,
    zevClassA: 8.00
  },
  obligationDetails: baseObligationDetails,
  radioDescriptions,
  salesRows,
  setSupplementaryAssessmentData: testFunction,
  supplementaryAssessmentData: {
    supplementaryAssessment: {
      penalty: 0,
      decision: { description: '{user.organization.name} has not complied.', id: 3 },
      inCompliance: false
    }
  },
  user: baseUser
}

const mockSupplementaryTabPropsTracker = jest.fn()
jest.mock('../SupplementaryTab', () => {
  const SupplementaryTabMock = (props) => {
    mockSupplementaryTabPropsTracker(props)
    return <div>SupplementaryTabMock</div>
  }
  return SupplementaryTabMock
})

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
  mockSupplementaryTabPropsTracker.mockClear()
  mockSupplierInformationPropsTracker.mockClear()
  mockZevSalesPropsTracker.mockClear()
  mockCreditActivityPropsTracker.mockClear()
  mockCommentInputPropsTracker.mockClear()
})

jest.replaceProperty(CONFIG.FEATURES.SUPPLEMENTAL_REPORT, 'ENABLED', true)

describe('SupplementaryAnalystDetails', () => {
  it('renders without crashing', () => {
    render(
      <Router>
        <SupplementaryAnalystDetails
          {...baseProps}
        />
      </Router>
    )
  })

  test('as an analyst, if i view a supplemental report in submitted status, i should be able to edit fields, add comments to supplier or director, click a radio button for the assessment, and save/recommend to director or return to supplier', () => {
    const details = { ...baseDetails, actualStatus: 'SUBMITTED', status: 'SUBMITTED' }
    const mockSetSupplementaryAssessmentData = jest.fn()
    const mockhandleSubmit = jest.fn()
    const props = { ...baseProps, details, setSupplementaryAssessmentData: mockSetSupplementaryAssessmentData, handleSubmit: mockhandleSubmit, isReassessment: false }
    const { queryAllByText, getByTestId } = render(
      <Router>
        <SupplementaryAnalystDetails
          {...props}
        />
      </Router>
    )

    expect(mockSupplierInformationPropsTracker).toHaveBeenCalledWith(
      expect.objectContaining({
        isEditable: true
      })
    )

    expect(mockZevSalesPropsTracker).toHaveBeenCalledWith(
      expect.objectContaining({
        isEditable: true
      })
    )

    expect(mockCreditActivityPropsTracker).toHaveBeenCalledWith(
      expect.objectContaining({
        isEditable: true
      })
    )

    expect(queryAllByText('CommentInputMock')).toHaveLength(2)

    expect(mockCommentInputPropsTracker).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Add comment to director: '
      })
    )

    expect(mockCommentInputPropsTracker).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Assessment Message to the Supplier: '
      })
    )

    radioDescriptions.forEach((radioDescription, index) => {
      const id = radioDescription.id
      const radioButton = getByTestId('recommendation-' + id)
      fireEvent.click(radioButton)
      expect(mockSetSupplementaryAssessmentData).toHaveBeenCalledTimes(index + 1)
    })

    const saveButton = getByTestId('save-button')
    fireEvent.click(saveButton)
    expect(mockhandleSubmit).toHaveBeenCalledWith('SUBMITTED', false)

    const recommendButton = getByTestId('recommend-button')
    fireEvent.click(recommendButton)
    expect(mockhandleSubmit).toHaveBeenCalledWith('RECOMMENDED')

    const returnButton = getByTestId('return-button')
    fireEvent.click(returnButton)
    expect(mockhandleSubmit).toHaveBeenCalledWith('DRAFT')
  })

  describe('as an analyst, if i view a supplemental report in any status, I should be able to view all 3 tabs', () => {
    const statuses = ['DRAFT', 'SUBMITTED', 'RECOMMENDED', 'RETURNED', 'ASSESSED', 'REASSESSED']
    statuses.forEach((status) => {
      test('as an analyst, if i view a ' + status + ' supplemental report, I should be able to view all 3 tabs', () => {
        const details = { ...baseDetails, actualStatus: status, status }
        const props = { ...baseProps, details, supplementaryReportId: 1, isReassessment: false }
        const { queryAllByText } = render(
          <Router>
            <SupplementaryAnalystDetails
              {...props}
            />
          </Router>
        )
        expect(queryAllByText('SupplementaryTabMock')).toHaveLength(3)
        expect(mockSupplementaryTabPropsTracker).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Supplementary Report',
            disabled: false
          })
        )
        expect(mockSupplementaryTabPropsTracker).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Reassessment Recommendation',
            disabled: false
          })
        )
        expect(mockSupplementaryTabPropsTracker).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Reassessment',
            disabled: false
          })
        )
      })
    })
  })

  describe('as an analyst, if i view a supplemental report in recommended status under any tab, it should be read only', () => {
    const tabs = ['supplemental', 'recommendation', 'reassessment']
    const details = { ...baseDetails, actualStatus: 'RECOMMENDED', status: 'RECOMMENDED' }
    tabs.forEach((tab) => {
      test('as an analyst, if i view a supplemental report in recommended status and under tab ' + tab + ', it should be read-only', () => {
        const props = { ...baseProps, details, query: { tab }, supplementaryReportId: 1, isReassessment: false }
        render(
          <Router>
            <SupplementaryAnalystDetails
              {...props}
            />
          </Router>
        )
        expect(mockSupplierInformationPropsTracker).toHaveBeenCalledWith(
          expect.objectContaining({
            isEditable: false
          })
        )
        expect(mockZevSalesPropsTracker).toHaveBeenCalledWith(
          expect.objectContaining({
            isEditable: false
          })
        )
        expect(mockCreditActivityPropsTracker).toHaveBeenCalledWith(
          expect.objectContaining({
            isEditable: false
          })
        )
      })
    })
  })

  describe('as an analyst, if i view a supplemental report in submitted status, it should non-editable under the supplemental and reassessment tabs, and editable under the recommendation tab', () => {
    const tabs = ['supplemental', 'recommendation', 'reassessment']
    const details = { ...baseDetails, actualStatus: 'SUBMITTED', status: 'SUBMITTED' }
    tabs.forEach((tab) => {
      let editable
      if (tab === tabs[0]) {
        editable = false
      } else if (tab === tabs[1]) {
        editable = true
      } else if (tab === tabs[2]) {
        editable = false
      }
      test(`as an analyst, if i view a supplemental report in submitted status and under the ${tab} tab, it should be${editable ? ' ' : ' not '}editable`, () => {
        const props = { ...baseProps, details, query: { tab }, supplementaryReportId: 1, isReassessment: false }
        render(
          <Router>
            <SupplementaryAnalystDetails
              {...props}
            />
          </Router>
        )
        expect(mockSupplierInformationPropsTracker).toHaveBeenCalledWith(
          expect.objectContaining({
            isEditable: editable
          })
        )
        expect(mockZevSalesPropsTracker).toHaveBeenCalledWith(
          expect.objectContaining({
            isEditable: editable
          })
        )
        expect(mockCreditActivityPropsTracker).toHaveBeenCalledWith(
          expect.objectContaining({
            isEditable: editable
          })
        )
      })
    })
  })

  describe('as an analyst, if i view a reassessment report in any status, I should be able to view the second two tabs', () => {
    const statuses = ['DRAFT', 'SUBMITTED', 'RECOMMENDED', 'RETURNED', 'ASSESSED', 'REASSESSED']
    statuses.forEach((status) => {
      test('as an analyst, if i view a ' + status + ' reassessment, I should be able to view the second two tabs', () => {
        const details = { ...baseDetails, actualStatus: status, status }
        const props = { ...baseProps, details, isReassessment: true }
        const { queryAllByText } = render(
          <Router>
            <SupplementaryAnalystDetails
              {...props}
            />
          </Router>
        )
        expect(queryAllByText('SupplementaryTabMock')).toHaveLength(2)
        expect(mockSupplementaryTabPropsTracker).not.toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Supplementary Report'
          })
        )
        expect(mockSupplementaryTabPropsTracker).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Reassessment Recommendation',
            disabled: false
          })
        )
        expect(mockSupplementaryTabPropsTracker).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Reassessment',
            disabled: false
          })
        )
      })
    })
  })
})
