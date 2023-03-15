import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { BrowserRouter } from 'react-router-dom'
import SupplementaryDirectorDetails from '../SupplementaryDirectorDetails'

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

describe('SupplementaryDirectorDetails', () => {
  beforeEach(() => {
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
      <BrowserRouter>
        <SupplementaryDirectorDetails
          {...props}
        />
      </BrowserRouter>
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
      <BrowserRouter>
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
      </BrowserRouter>
    )
    expect(getByText('ComplianceHistory')).toBeInTheDocument()
    expect(getByText('SupplierInformation')).toBeInTheDocument()
    expect(getByText('ZevSales')).toBeInTheDocument()
    expect(getByText('CreditActivity')).toBeInTheDocument()
  })

  it('renders ReassessmentDetailsPage when conditions are met', () => {
    const { getByText } = render(
      <BrowserRouter>
        <SupplementaryDirectorDetails
          {...props}
          isReassessment={true}
          query={{ tab: 'reassessment' }}
        />
      </BrowserRouter>
    )
    expect(getByText('ReassessmentDetailsPage')).toBeInTheDocument()
  })

  // Test rendering of EditableCommentList when conditions are met
  it('renders EditableCommentList when conditions are met', () => {
    const { getByText } = render(
      <BrowserRouter>
        <SupplementaryDirectorDetails
          {...props}
          details={{ ...details, actualStatus: 'RECOMMENDED' }}
          query={{ tab: 'reassessment' }}
          // commentArray={commentArray}
        />
      </BrowserRouter>
    )
    expect(getByText('EditableCommentList')).toBeInTheDocument()
  })

  // Test click on Print Page button
  it('click on Print Page button', () => {
    window.print = jest.fn()
    const { getByText } = render(
      <BrowserRouter>
        <SupplementaryDirectorDetails
          {...props}
        />
      </BrowserRouter>
    )
    fireEvent.click(getByText('Print Page'))
    expect(window.print).toHaveBeenCalledTimes(1)
  })
})

// TESTS TO WRITE

// as an analyst
// if i view a supplemental report in submitted status
// i should be able to edit fields, add comments to supplier or director,
// click a radio button for the assessment, and save/recommend to director or return to supplier

// as an analyst
// if i view a supplemental report in recommended status
// I should be able to view a read only version of all 3 tabs

// as an analyst
// if i view a supplemental report in any status
// I should be able to view all 3 tabs

// as an analyst
// if i view a reassessment report in any status
// I should be able to view the second two tabs

// as an analyst
// if i view a supplemental report in submitted status
// I should be able to view a editable version of all 3 tabs

// Replace these constants with the relevant data for your tests