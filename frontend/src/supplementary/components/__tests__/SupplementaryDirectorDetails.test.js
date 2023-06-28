import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { MemoryRouter } from 'react-router-dom'
import SupplementaryDirectorDetails from '../SupplementaryDirectorDetails'
import CONFIG from '../../../app/config'

jest.mock('../../../compliance/components/ComplianceHistory', () => {
  const ComplianceHistoryMock = () => <div>ComplianceHistory</div>
  ComplianceHistoryMock.displayName = 'ComplianceHistory'
  return ComplianceHistoryMock
})
jest.mock('../../../app/components/EditableCommentList', () => {
  const EditableCommentListMock = () => <div>EditableCommentList</div>
  EditableCommentListMock.displayName = 'EditableCommentList'
  return EditableCommentListMock
})
jest.mock('../../../app/components/CommentInput', () => {
  const CommentInputMock = () => <div>CommentInput</div>
  CommentInputMock.displayName = 'CommentInput'
  return CommentInputMock
})
jest.mock('../ReassessmentDetailsPage', () => {
  const ReassessmentDetailsPageMock = () => <div>ReassessmentDetailsPage</div>
  ReassessmentDetailsPageMock.displayName = 'ReassessmentDetailsPage'
  return ReassessmentDetailsPageMock
})
jest.mock('../SupplierInformation', () => {
  const SupplierInformationMock = () => <div>SupplierInformation</div>
  SupplierInformationMock.displayName = 'SupplierInformation'
  return SupplierInformationMock
})
jest.mock('../ZevSales', () => {
  const ZevSalesMock = () => <div>ZevSales</div>
  ZevSalesMock.displayName = 'ZevSales'
  return ZevSalesMock
})
jest.mock('../CreditActivity', () => {
  const CreditActivityMock = () => <div>CreditActivity</div>
  CreditActivityMock.displayName = 'CreditActivity'
  return CreditActivityMock
})

const mockHandleSubmit = jest.fn()

jest.mock('../../../app/components/Button', () => {
  const React = require('react')
  const { Link } = require('react-router-dom')

  return jest.fn().mockImplementation(({ buttonType, action, optionalText, optionalClassname, locationRoute, ...props }) => {
    const buttonText = optionalText || buttonType
    const className = optionalClassname ? `${optionalClassname} button` : 'button'

    if (locationRoute) {
      return (
        <Link to={locationRoute} className={className} data-testid={buttonType} {...props}>
          {buttonText}
        </Link>
      )
    }

    return (
      <button data-testid={buttonType} className={className} onClick={action} {...props}>
        {buttonText}
      </button>
    )
  })
})

describe('SupplementaryDirectorDetails', () => {
  beforeEach(() => {
    CONFIG.FEATURES.SUPPLEMENTAL_REPORT.ENABLED = true
  })

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
  const details = {
    id: '1',
    status: 'DRAFT',
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
  const supplementaryAssessmentData = {
    supplementaryAssessment: {
      penalty: 0,
      decision: { description: '{user.organization.name} has not complied.', id: 3 },
      inCompliance: false
    }
  }
  const props = {
    addSalesRow: testFunction,
    commentArray,
    deleteFiles: [{}],
    details,
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
    radioDescriptions,
    salesRows,
    setSupplementaryAssessmentData: testFunction,
    supplementaryAssessmentData,
    user: { isGovernment: true },
    analystAction: false
  }

  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <SupplementaryDirectorDetails
          {...props}
        />
      </MemoryRouter>
    )
  })

  // Test rendering of SupplementaryDirectorDetails component
  it('renders SupplementaryDirectorDetails child components with custom props', () => {
    const id = '1'
    const isReassessment = false
    const reportYear = '2022'
    const supplementaryReportId = '2'
    const supplementaryReportIsReassessment = false
    const user = {
      userType: 'Government',
      hasPermission: () => true
    }
    const selectedTab = 'Summary'
    const currentStatus = 'DRAFT'
    const { getByText } = render(
      <MemoryRouter>
        <SupplementaryDirectorDetails
          {...props}
          id={id}
          isReassessment={isReassessment}
          reportYear={reportYear}
          supplementaryReportId={supplementaryReportId}
          supplementaryReportIsReassessment={supplementaryReportIsReassessment}
          user={user}
          selectedTab={selectedTab}
          currentStatus={currentStatus}
          details={details}
          commentArray={commentArray}
        />
      </MemoryRouter>
    )
    expect(getByText('ComplianceHistory')).toBeInTheDocument()
    expect(getByText('SupplierInformation')).toBeInTheDocument()
    expect(getByText('ZevSales')).toBeInTheDocument()
    expect(getByText('CreditActivity')).toBeInTheDocument()
  })

  it('renders the correct style of ReassessmentDetailsPage when conditions are met', () => {
    const { queryByText } = render(
      <MemoryRouter>
        <SupplementaryDirectorDetails
          {...props}
          isReassessment={true}
          query={{ tab: 'reassessment' }}
        />
      </MemoryRouter>
    )
    expect(queryByText('ReassessmentDetailsPage')).toBeInTheDocument()
    expect(queryByText('SupplierInformation')).not.toBeInTheDocument()
    expect(queryByText('ZevSales')).not.toBeInTheDocument()
    expect(queryByText('CreditActivity')).not.toBeInTheDocument()
  })

  it('does not render ReassessmentDetailsPage when conditions are incorrect', () => {
    const { queryByText } = render(
      <MemoryRouter>
        <SupplementaryDirectorDetails
          {...props}
          isReassessment={false}
        />
      </MemoryRouter>
    )
    expect(queryByText('ReassessmentDetailsPage')).not.toBeInTheDocument()
    expect(queryByText('SupplierInformation')).toBeInTheDocument()
    expect(queryByText('ZevSales')).toBeInTheDocument()
    expect(queryByText('CreditActivity')).toBeInTheDocument()
  })

  // Test rendering of EditableCommentList when conditions are met
  it('renders EditableCommentList when conditions are met', () => {
    const { getByText } = render(
      <MemoryRouter>
        <SupplementaryDirectorDetails
          {...props}
          details={{ ...details, actualStatus: 'RECOMMENDED' }}
          query={{ tab: 'reassessment' }}
        />
      </MemoryRouter>
    )
    expect(getByText('EditableCommentList')).toBeInTheDocument()
  })

  // Test click on Print Page button
  it('click on Print Page button', () => {
    window.print = jest.fn()
    const { getByText } = render(
      <MemoryRouter>
        <SupplementaryDirectorDetails
          {...props}
        />
      </MemoryRouter>
    )
    fireEvent.click(getByText('Print Page'))
    expect(window.print).toHaveBeenCalledTimes(1)
  })

  it('should not render "Director Reassessment" section when conditions are not met', () => {
    render(
      <MemoryRouter>
        <SupplementaryDirectorDetails
          {...props}
          currentStatus={'INCORRECT_STATUS'}
        />
      </MemoryRouter>
    )
    const reassessmentHeader = screen.queryByText('Director Reassessment')
    expect(reassessmentHeader).not.toBeInTheDocument()
  })

  it('should render "Director Reassessment" section when conditions are met', () => {
    render(
      <MemoryRouter>
        <SupplementaryDirectorDetails
          {...props}
          details={{ ...details, actualStatus: 'ASSESSED' }}
          supplementaryAssessmentData={
            {
              supplementaryAssessment: {
                decision: {
                  description: 'Some description'
                }
              }
            }
          }
        />
      </MemoryRouter>
    )
    const reassessmentHeader = screen.getByText('Director Reassessment')
    expect(reassessmentHeader).toBeInTheDocument()
  })

  it('should display assessment decision text correctly', () => {
    render(
      <MemoryRouter>
        <SupplementaryDirectorDetails
          {...props}
          details={{ ...details, actualStatus: 'ASSESSED' }}
          supplementaryAssessmentData={
            {
              supplementaryAssessment: {
                decision: {
                  description: 'this model year of {modelYear} is assessed.'
                }
              }
            }
          }
          assessmentDecision={'Complaint'}
        />
      </MemoryRouter>
    )
    const decisionText = screen.getByText('The Director has assessed that this model year of 2021 is assessed.')
    expect(decisionText).toBeInTheDocument()
  })

  it('should display comment when available', () => {
    render(
      <MemoryRouter>
        <SupplementaryDirectorDetails
          {...props}
          details={{ ...details, actualStatus: 'ASSESSED' }}
          supplementaryAssessmentData={
            {
              supplementaryAssessment: {
                decision: {
                  description: 'Some description'
                }
              }
            }
          }
          assessmentDecision={'Complaint'}
          commentArray={
            {
              bceidComment: {
                comment: 'This is a sample comment.'
              }
            }
         }
        />
      </MemoryRouter>
    )
    const commentText = screen.getByText('This is a sample comment.')
    expect(commentText).toBeInTheDocument()
  })

  it('should render Recommended Header', () => {
    const setSupplementaryAssessmentData = jest.fn()
    render(
      <MemoryRouter>
        <SupplementaryDirectorDetails
          {...props}
          details={{ ...details, actualStatus: 'ASSESSED' }}
          setSupplementaryAssessmentData={setSupplementaryAssessmentData}
          supplementaryAssessmentData={
            {
              supplementaryAssessment: {
                assessmentPenalty: 0
              }
            }
          }
          query={{ tab: 'recommendation' }}
        />
      </MemoryRouter>
    )
    const recommendedHeader = screen.queryByText('Analyst Recommended Director Assessment')
    expect(recommendedHeader).toBeInTheDocument()
  })

  it('should render back button', () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <SupplementaryDirectorDetails
          {...props}
          details={{ ...details, actualStatus: 'RECOMMENDED' }}
          handleSubmit={mockHandleSubmit}
        />
      </MemoryRouter>
    )
    const backButton = getByTestId('back')
    expect(backButton).toBeInTheDocument()
  })

  it('should trigger handleSubmit with "RETURNED" when return button is clicked', () => {
    const { queryByText } = render(
      <MemoryRouter>
        <SupplementaryDirectorDetails
          {...props}
          details={{ ...details, actualStatus: 'RECOMMENDED' }}
          handleSubmit={mockHandleSubmit}
          query={{ tab: 'reassessment' }}
        />
      </MemoryRouter>
    )

    const returnButton = queryByText('Return to Analyst')
    fireEvent.click(returnButton)

    expect(mockHandleSubmit).toHaveBeenCalledWith('RETURNED')
  })

  it('should trigger handleSubmit with "ASSESSED" when issue assessment button is clicked', () => {
    const { queryByText } = render(
      <MemoryRouter>
        <SupplementaryDirectorDetails
          {...props}
          details={{ ...details, actualStatus: 'RECOMMENDED' }}
          handleSubmit={mockHandleSubmit}
          query={{ tab: 'reassessment' }}
        />
      </MemoryRouter>
    )

    const issueAssessmentButton = queryByText('Issue Assessment')
    fireEvent.click(issueAssessmentButton)

    expect(mockHandleSubmit).toHaveBeenCalledWith('ASSESSED')
  })
})
