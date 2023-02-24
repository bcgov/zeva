import React from 'react'
import { render } from '@testing-library/react'
import SupplementaryAnalystDetails from '../SupplementaryAnalystDetails'
import '@testing-library/jest-dom/extend-expect'
import { BrowserRouter as Router } from 'react-router-dom'
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
describe('SupplementaryAnalystDetails', () => {
  it('renders without crashing', () => {
    render(
      <Router>
        <SupplementaryAnalystDetails
          addSalesRow={testFunction}
          commentArray={commentArray}
          deleteFiles={[{}]}
          details={details}
          handleAddIdirComment={testFunction}
          handleCommentChangeBceid={testFunction}
          handleCommentChangeIdir={testFunction}
          handleDeleteIdirComment={testFunction}
          handleEditIdirComment={testFunction}
          handleInputChange={testFunction}
          handleSubmit={testFunction}
          handleSupplementalChange={testFunction}
          id={1}
          loading={false}
          ldvSales={1000}
          newData={newData}
          newBalances={{}}
          ratios={{
            complianceRatio: 12.00,
            modelYear: '2021',
            id: 1,
            zevClassA: 8.00
          }}
          radioDescriptions={radioDescriptions}
          salesRows={salesRows}
          setSupplementaryAssessmentData={testFunction}
          supplementaryAssessmentData={
              {
                supplementaryAssessment: {
                  penalty: 0,
                  decision: { description: '{user.organization.name} has not complied.', id: 3 },
                  inCompliance: false
                }
              }
            }
          user={{ isGovernment: true }}
        />
      </Router>
    )
  })
})
