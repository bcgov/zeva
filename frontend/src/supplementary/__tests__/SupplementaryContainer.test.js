import React from 'react'
import { describe, expect, test } from '@jest/globals'
import { render, act, screen, fireEvent } from '@testing-library/react'
import SupplementaryContainer from '../SupplementaryContainer'
import * as SupplementaryCreate from '../components/SupplementaryCreate'
import * as SupplementaryAnalystDetails from '../components/SupplementaryAnalystDetails'
import * as SupplementaryDirectorDetails from '../components/SupplementaryDirectorDetails'
import * as SupplementarySupplierDetails from '../components/SupplementarySupplierDetails'
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
  // can override these implementations in individual tests by using jest.spyOn()
  jest.spyOn(SupplementaryCreate, 'default').mockImplementation(() => {
    return <div>SupplementaryCreateMock</div>
  })
  jest.spyOn(SupplementaryAnalystDetails, 'default').mockImplementation(() => {
    return <div>SupplementaryAnalystDetailsMock</div>
  })
  jest.spyOn(SupplementaryDirectorDetails, 'default').mockImplementation(() => {
    return <div>SupplementaryDirectorDetailsMock</div>
  })
  jest.spyOn(SupplementarySupplierDetails, 'default').mockImplementation(() => {
    return <div>SupplementarySupplierDetailsMock</div>
  })
  jest.spyOn(ReactRouter, 'useParams').mockReturnValue(baseParams)
  jest.spyOn(ReactRouter, 'useLocation').mockReturnValue(baseLocation)
  // mock the data returned in refreshDetails()
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

  test('renders with non-trivial data without crashing', async () => {
    const reportId = 142
    const supplementaryId = 3
    const data = {
      supplementaryDetails: {
        id: 3,
        status: 'ASSESSED',
        ldvSales: 15000,
        creditActivity: [
          {
            id: 19,
            creditAValue: '0.00',
            creditBValue: '0.00',
            category: 'ProvisionalBalanceAfterCreditReduction',
            modelYear: {
              name: '2019',
              effectiveDate: '2019-01-01',
              expirationDate: '2019-12-31'
            }
          },
          {
            id: 20,
            creditAValue: '0.00',
            creditBValue: '0.00',
            category: 'ProvisionalBalanceAfterCreditReduction',
            modelYear: {
              name: '2020',
              effectiveDate: '2020-01-01',
              expirationDate: '2020-12-31'
            }
          },
          {
            id: 21,
            creditAValue: '1598.88',
            creditBValue: '0.00',
            category: 'ProvisionalBalanceAfterCreditReduction',
            modelYear: {
              name: '2021',
              effectiveDate: '2021-01-01',
              expirationDate: '2021-12-31'
            }
          }
        ],
        assessmentData: {
          legalName: 'Ford Motor Company of Canada Ltd.',
          supplierClass: 'Large Volume Supplier',
          reportAddress: [
            {
              id: 309,
              representativeName: null,
              addressLine1: '789 Yonge St',
              addressLine2: null,
              addressLine3: null,
              city: 'Toronto',
              postalCode: 'T9T9O9',
              state: 'ON',
              county: null,
              country: 'Canada',
              addressType: {
                addressType: 'Service'
              }
            },
            {
              id: 310,
              representativeName: null,
              addressLine1: '456 Granville St',
              addressLine2: null,
              addressLine3: null,
              city: 'Vancouver',
              postalCode: 'V5V4W6',
              state: 'BC',
              county: null,
              country: 'Canada',
              addressType: {
                addressType: 'Records'
              }
            }
          ],
          makes: [
            'FORD'
          ],
          modelYear: '2021',
          zevSales: [
            {
              id: 235,
              pendingSales: 0,
              salesIssued: 750,
              make: 'Ford',
              modelName: 'Mustang',
              range: '415.00',
              zevClass: 'A',
              modelYear: '2021',
              vehicleZevType: 'BEV',
              updateTimestamp: '2023-06-20T15:53:48.746641-07:00'
            }
          ],
          creditReductionSelection: 'B'
        },
        zevSales: [],
        supplierInformation: [],
        attachments: [],
        fromSupplierComments: null,
        actualStatus: 'ASSESSED',
        createUser: {
          id: 443,
          firstName: 'James',
          lastName: 'Donald',
          email: 'james.donald@gov.bc.ca',
          displayName: 'James Donald',
          isActive: true,
          phone: null,
          roles: [
            {
              id: 1,
              roleCode: 'Administrator',
              description: 'can add and manage idir users and assign roles',
              permissions: [
                {
                  id: 11,
                  permissionCode: 'ASSIGN_IDIR_ROLES',
                  name: 'Assign IDIR Roles',
                  description: 'can assign roles to government (IDIR) users'
                },
                {
                  id: 10,
                  permissionCode: 'DELETE_USERS',
                  name: 'Delete Users',
                  description: 'can hide/disable users'
                },
                {
                  id: 8,
                  permissionCode: 'CREATE_USERS',
                  name: 'Create Users',
                  description: 'can create new users'
                },
                {
                  id: 4,
                  permissionCode: 'CREATE_ORGANIZATIONS',
                  name: 'Create Organizations',
                  description: 'can create new organizations'
                },
                {
                  id: 6,
                  permissionCode: 'DELETE_ORGANIZATIONS',
                  name: 'Delete Organizations',
                  description: 'can hide/disable organizations'
                },
                {
                  id: 3,
                  permissionCode: 'VIEW_ORGANIZATIONS',
                  name: 'View Organizations',
                  description: 'can view organization information'
                },
                {
                  id: 12,
                  permissionCode: 'ASSIGN_BCEID_ROLES',
                  name: 'Assign BCeID Roles',
                  description: 'can assign roles to external (BCeID) users'
                },
                {
                  id: 7,
                  permissionCode: 'VIEW_USERS',
                  name: 'View Users',
                  description: 'can view user information'
                },
                {
                  id: 9,
                  permissionCode: 'EDIT_USERS',
                  name: 'Edit Users',
                  description: 'can edit user information'
                },
                {
                  id: 5,
                  permissionCode: 'EDIT_ORGANIZATIONS',
                  name: 'Edit Organizations',
                  description: 'can edit organization information'
                },
                {
                  id: 2,
                  permissionCode: 'VIEW_ROLES_AND_PERMISSIONS',
                  name: 'View Roles and Permissions',
                  description: 'can view roles and permissions information'
                },
                {
                  id: 1,
                  permissionCode: 'VIEW_DASHBOARD',
                  name: 'View Dashboard',
                  description: 'can view dashboard tasks and reports filtered by user role'
                }
              ],
              isGovernmentRole: true
            },
            {
              id: 2,
              roleCode: 'Director',
              description: 'can provide statutory decisions to issue, record and/or approve Credit Applications and Transfers',
              permissions: [
                {
                  id: 64,
                  permissionCode: 'REJECT_CREDIT_TRANSFER',
                  name: 'Reject Credit Transfer',
                  description: 'Can reject credit transfers'
                },
                {
                  id: 7,
                  permissionCode: 'VIEW_USERS',
                  name: 'View Users',
                  description: 'can view user information'
                },
                {
                  id: 17,
                  permissionCode: 'VIEW_CREDIT_TRANSFERS',
                  name: 'View Credit Transfers',
                  description: 'can view credit transfers'
                },
                {
                  id: 13,
                  permissionCode: 'VIEW_ZEV',
                  name: 'View ZEV',
                  description: 'can view ZEV model information'
                },
                {
                  id: 27,
                  permissionCode: 'SIGN_PURCHASE_REQUESTS',
                  name: 'Sign Purchase Requests',
                  description: 'can approve and sign a purchase requests'
                },
                {
                  id: 18,
                  permissionCode: 'SIGN_CREDIT_TRANSFERS',
                  name: 'Sign Credit Transfers',
                  description: 'can approve and sign a credit transfers'
                },
                {
                  id: 28,
                  permissionCode: 'DECLINE_PURCHASE_REQUESTS',
                  name: 'Decline Purchase Requests',
                  description: 'can decline to approve a purchase requests'
                },
                {
                  id: 22,
                  permissionCode: 'REJECT_COMPLIANCE_REPORT',
                  name: 'Reject Compliance Report',
                  description: 'can reject a compliance report'
                },
                {
                  id: 14,
                  permissionCode: 'VIEW_SALES',
                  name: 'View Sales',
                  description: 'can view sales submissions for early credits'
                },
                {
                  id: 29,
                  permissionCode: 'VIEW_FILE_SUBMISSIONS',
                  name: 'View File Submissions',
                  description: 'can view and download files that have been uploaded'
                },
                {
                  id: 3,
                  permissionCode: 'VIEW_ORGANIZATIONS',
                  name: 'View Organizations',
                  description: 'can view organization information'
                },
                {
                  id: 24,
                  permissionCode: 'SIGN_INITIATIVE_AGREEMENTS',
                  name: 'Sign Initiative Agreements',
                  description: 'can approve and sign an initiative agreements'
                },
                {
                  id: 25,
                  permissionCode: 'DECLINE_INITIATIVE_AGREEMENTS',
                  name: 'Decline Initiative Agreements',
                  description: 'can decline to approve an initiative agreements'
                },
                {
                  id: 23,
                  permissionCode: 'VIEW_INITIATIVE_AGREEMENTS',
                  name: 'View Initiative Agreements',
                  description: 'can view initiative agreements'
                },
                {
                  id: 16,
                  permissionCode: 'DECLINE_SALES',
                  name: 'Decline Sales',
                  description: 'can decline to approve a sales submission for early credits'
                },
                {
                  id: 26,
                  permissionCode: 'VIEW_PURCHASE_REQUESTS',
                  name: 'View Purchase Requests',
                  description: 'can view credit purchase requests'
                },
                {
                  id: 20,
                  permissionCode: 'VIEW_COMPLIANCE_REPORTS',
                  name: 'View Compliance Reports',
                  description: 'can view compliance reports'
                },
                {
                  id: 1,
                  permissionCode: 'VIEW_DASHBOARD',
                  name: 'View Dashboard',
                  description: 'can view dashboard tasks and reports filtered by user role'
                },
                {
                  id: 21,
                  permissionCode: 'SIGN_COMPLIANCE_REPORT',
                  name: 'Sign Compliance Report',
                  description: 'can accept and sign a compliance report'
                },
                {
                  id: 15,
                  permissionCode: 'SIGN_SALES',
                  name: 'Sign Sales',
                  description: 'can approve and sign a sales submission for early credits'
                },
                {
                  id: 19,
                  permissionCode: 'DECLINE_CREDIT_TRANSFERS',
                  name: 'Decline Credit Transfers',
                  description: 'can decline to approve a credit transfers'
                }
              ],
              isGovernmentRole: true
            }
          ],
          isMapped: true
        },
        reassessment: {
          isReassessment: true,
          supplementaryReportId: 2,
          status: 'SUBMITTED',
          supplementaryReportIsReassessment: false
        }
      },
      assessedSupplementals: [
        {
          id: 3,
          status: 'ASSESSED',
          ldvSales: 15000,
          creditActivity: [
            {
              id: 19,
              creditAValue: '0.00',
              creditBValue: '0.00',
              category: 'ProvisionalBalanceAfterCreditReduction',
              modelYear: {
                name: '2019',
                effectiveDate: '2019-01-01',
                expirationDate: '2019-12-31'
              }
            },
            {
              id: 20,
              creditAValue: '0.00',
              creditBValue: '0.00',
              category: 'ProvisionalBalanceAfterCreditReduction',
              modelYear: {
                name: '2020',
                effectiveDate: '2020-01-01',
                expirationDate: '2020-12-31'
              }
            },
            {
              id: 21,
              creditAValue: '1598.88',
              creditBValue: '0.00',
              category: 'ProvisionalBalanceAfterCreditReduction',
              modelYear: {
                name: '2021',
                effectiveDate: '2021-01-01',
                expirationDate: '2021-12-31'
              }
            }
          ],
          assessmentData: {
            legalName: 'Ford Motor Company of Canada Ltd.',
            supplierClass: 'Large Volume Supplier',
            reportAddress: [
              {
                id: 309,
                representativeName: null,
                addressLine1: '789 Yonge St',
                addressLine2: null,
                addressLine3: null,
                city: 'Toronto',
                postalCode: 'T9T9O9',
                state: 'ON',
                county: null,
                country: 'Canada',
                addressType: {
                  addressType: 'Service'
                }
              },
              {
                id: 310,
                representativeName: null,
                addressLine1: '456 Granville St',
                addressLine2: null,
                addressLine3: null,
                city: 'Vancouver',
                postalCode: 'V5V4W6',
                state: 'BC',
                county: null,
                country: 'Canada',
                addressType: {
                  addressType: 'Records'
                }
              }
            ],
            makes: [
              'FORD'
            ],
            modelYear: '2021',
            zevSales: [
              {
                id: 235,
                pendingSales: 0,
                salesIssued: 750,
                make: 'Ford',
                modelName: 'Mustang',
                range: '415.00',
                zevClass: 'A',
                modelYear: '2021',
                vehicleZevType: 'BEV',
                updateTimestamp: '2023-06-20T15:53:48.746641-07:00'
              }
            ],
            creditReductionSelection: 'B'
          },
          zevSales: [],
          supplierInformation: [],
          attachments: [],
          fromSupplierComments: null,
          actualStatus: 'ASSESSED',
          createUser: {
            id: 443,
            firstName: 'James',
            lastName: 'Donald',
            email: 'james.donald@gov.bc.ca',
            displayName: 'James Donald',
            isActive: true,
            phone: null,
            roles: [
              {
                id: 1,
                roleCode: 'Administrator',
                description: 'can add and manage idir users and assign roles',
                permissions: [
                  {
                    id: 11,
                    permissionCode: 'ASSIGN_IDIR_ROLES',
                    name: 'Assign IDIR Roles',
                    description: 'can assign roles to government (IDIR) users'
                  },
                  {
                    id: 10,
                    permissionCode: 'DELETE_USERS',
                    name: 'Delete Users',
                    description: 'can hide/disable users'
                  },
                  {
                    id: 8,
                    permissionCode: 'CREATE_USERS',
                    name: 'Create Users',
                    description: 'can create new users'
                  },
                  {
                    id: 4,
                    permissionCode: 'CREATE_ORGANIZATIONS',
                    name: 'Create Organizations',
                    description: 'can create new organizations'
                  },
                  {
                    id: 6,
                    permissionCode: 'DELETE_ORGANIZATIONS',
                    name: 'Delete Organizations',
                    description: 'can hide/disable organizations'
                  },
                  {
                    id: 3,
                    permissionCode: 'VIEW_ORGANIZATIONS',
                    name: 'View Organizations',
                    description: 'can view organization information'
                  },
                  {
                    id: 12,
                    permissionCode: 'ASSIGN_BCEID_ROLES',
                    name: 'Assign BCeID Roles',
                    description: 'can assign roles to external (BCeID) users'
                  },
                  {
                    id: 7,
                    permissionCode: 'VIEW_USERS',
                    name: 'View Users',
                    description: 'can view user information'
                  },
                  {
                    id: 9,
                    permissionCode: 'EDIT_USERS',
                    name: 'Edit Users',
                    description: 'can edit user information'
                  },
                  {
                    id: 5,
                    permissionCode: 'EDIT_ORGANIZATIONS',
                    name: 'Edit Organizations',
                    description: 'can edit organization information'
                  },
                  {
                    id: 2,
                    permissionCode: 'VIEW_ROLES_AND_PERMISSIONS',
                    name: 'View Roles and Permissions',
                    description: 'can view roles and permissions information'
                  },
                  {
                    id: 1,
                    permissionCode: 'VIEW_DASHBOARD',
                    name: 'View Dashboard',
                    description: 'can view dashboard tasks and reports filtered by user role'
                  }
                ],
                isGovernmentRole: true
              },
              {
                id: 2,
                roleCode: 'Director',
                description: 'can provide statutory decisions to issue, record and/or approve Credit Applications and Transfers',
                permissions: [
                  {
                    id: 64,
                    permissionCode: 'REJECT_CREDIT_TRANSFER',
                    name: 'Reject Credit Transfer',
                    description: 'Can reject credit transfers'
                  },
                  {
                    id: 7,
                    permissionCode: 'VIEW_USERS',
                    name: 'View Users',
                    description: 'can view user information'
                  },
                  {
                    id: 17,
                    permissionCode: 'VIEW_CREDIT_TRANSFERS',
                    name: 'View Credit Transfers',
                    description: 'can view credit transfers'
                  },
                  {
                    id: 13,
                    permissionCode: 'VIEW_ZEV',
                    name: 'View ZEV',
                    description: 'can view ZEV model information'
                  },
                  {
                    id: 27,
                    permissionCode: 'SIGN_PURCHASE_REQUESTS',
                    name: 'Sign Purchase Requests',
                    description: 'can approve and sign a purchase requests'
                  },
                  {
                    id: 18,
                    permissionCode: 'SIGN_CREDIT_TRANSFERS',
                    name: 'Sign Credit Transfers',
                    description: 'can approve and sign a credit transfers'
                  },
                  {
                    id: 28,
                    permissionCode: 'DECLINE_PURCHASE_REQUESTS',
                    name: 'Decline Purchase Requests',
                    description: 'can decline to approve a purchase requests'
                  },
                  {
                    id: 22,
                    permissionCode: 'REJECT_COMPLIANCE_REPORT',
                    name: 'Reject Compliance Report',
                    description: 'can reject a compliance report'
                  },
                  {
                    id: 14,
                    permissionCode: 'VIEW_SALES',
                    name: 'View Sales',
                    description: 'can view sales submissions for early credits'
                  },
                  {
                    id: 29,
                    permissionCode: 'VIEW_FILE_SUBMISSIONS',
                    name: 'View File Submissions',
                    description: 'can view and download files that have been uploaded'
                  },
                  {
                    id: 3,
                    permissionCode: 'VIEW_ORGANIZATIONS',
                    name: 'View Organizations',
                    description: 'can view organization information'
                  },
                  {
                    id: 24,
                    permissionCode: 'SIGN_INITIATIVE_AGREEMENTS',
                    name: 'Sign Initiative Agreements',
                    description: 'can approve and sign an initiative agreements'
                  },
                  {
                    id: 25,
                    permissionCode: 'DECLINE_INITIATIVE_AGREEMENTS',
                    name: 'Decline Initiative Agreements',
                    description: 'can decline to approve an initiative agreements'
                  },
                  {
                    id: 23,
                    permissionCode: 'VIEW_INITIATIVE_AGREEMENTS',
                    name: 'View Initiative Agreements',
                    description: 'can view initiative agreements'
                  },
                  {
                    id: 16,
                    permissionCode: 'DECLINE_SALES',
                    name: 'Decline Sales',
                    description: 'can decline to approve a sales submission for early credits'
                  },
                  {
                    id: 26,
                    permissionCode: 'VIEW_PURCHASE_REQUESTS',
                    name: 'View Purchase Requests',
                    description: 'can view credit purchase requests'
                  },
                  {
                    id: 20,
                    permissionCode: 'VIEW_COMPLIANCE_REPORTS',
                    name: 'View Compliance Reports',
                    description: 'can view compliance reports'
                  },
                  {
                    id: 1,
                    permissionCode: 'VIEW_DASHBOARD',
                    name: 'View Dashboard',
                    description: 'can view dashboard tasks and reports filtered by user role'
                  },
                  {
                    id: 21,
                    permissionCode: 'SIGN_COMPLIANCE_REPORT',
                    name: 'Sign Compliance Report',
                    description: 'can accept and sign a compliance report'
                  },
                  {
                    id: 15,
                    permissionCode: 'SIGN_SALES',
                    name: 'Sign Sales',
                    description: 'can approve and sign a sales submission for early credits'
                  },
                  {
                    id: 19,
                    permissionCode: 'DECLINE_CREDIT_TRANSFERS',
                    name: 'Decline Credit Transfers',
                    description: 'can decline to approve a credit transfers'
                  }
                ],
                isGovernmentRole: true
              }
            ],
            isMapped: true
          },
          reassessment: {
            isReassessment: true,
            supplementaryReportId: 2,
            status: 'SUBMITTED',
            supplementaryReportIsReassessment: false
          }
        }
      ],
      complianceDetails: {
        complianceObligation: [
          {
            creditAValue: '2040.00',
            creditBValue: '0.00',
            category: 'ProvisionalBalanceAfterCreditReduction',
            modelYear: {
              name: '2021',
              effectiveDate: '2021-01-01',
              expirationDate: '2021-12-31'
            },
            updateTimestamp: '2023-06-20T16:06:51.919243-07:00'
          },
          {
            creditAValue: '38.88',
            creditBValue: '0.00',
            category: 'ProvisionalBalanceAfterCreditReduction',
            modelYear: {
              name: '2020',
              effectiveDate: '2020-01-01',
              expirationDate: '2020-12-31'
            },
            updateTimestamp: '2023-06-20T16:06:51.841985-07:00'
          },
          {
            creditAValue: '0.00',
            creditBValue: '0.00',
            category: 'ProvisionalBalanceAfterCreditReduction',
            modelYear: {
              name: '2019',
              effectiveDate: '2019-01-01',
              expirationDate: '2019-12-31'
            },
            updateTimestamp: '2023-06-20T16:06:51.840276-07:00'
          },
          {
            creditAValue: '0.00',
            creditBValue: '0.00',
            category: 'UnspecifiedClassCreditReduction',
            modelYear: {
              name: '2021',
              effectiveDate: '2021-01-01',
              expirationDate: '2021-12-31'
            },
            updateTimestamp: '2023-06-20T16:06:51.838595-07:00'
          },
          {
            creditAValue: '133.12',
            creditBValue: '0.00',
            category: 'UnspecifiedClassCreditReduction',
            modelYear: {
              name: '2020',
              effectiveDate: '2020-01-01',
              expirationDate: '2020-12-31'
            },
            updateTimestamp: '2023-06-20T16:06:51.836930-07:00'
          },
          {
            creditAValue: '0.00',
            creditBValue: '306.88',
            category: 'UnspecifiedClassCreditReduction',
            modelYear: {
              name: '2019',
              effectiveDate: '2019-01-01',
              expirationDate: '2019-12-31'
            },
            updateTimestamp: '2023-06-20T16:06:51.835269-07:00'
          },
          {
            creditAValue: '880.00',
            creditBValue: '0.00',
            category: 'ClassAReduction',
            modelYear: {
              name: '2020',
              effectiveDate: '2020-01-01',
              expirationDate: '2020-12-31'
            },
            updateTimestamp: '2023-06-20T16:06:51.833601-07:00'
          },
          {
            creditAValue: '400.00',
            creditBValue: '0.00',
            category: 'transfersOut',
            modelYear: {
              name: '2020',
              effectiveDate: '2020-01-01',
              expirationDate: '2020-12-31'
            },
            updateTimestamp: '2023-06-20T16:06:51.831955-07:00'
          },
          {
            creditAValue: '1694.00',
            creditBValue: '0.00',
            category: 'creditsIssuedSales',
            modelYear: {
              name: '2021',
              effectiveDate: '2021-01-01',
              expirationDate: '2021-12-31'
            },
            updateTimestamp: '2023-06-20T16:06:51.830300-07:00'
          },
          {
            creditAValue: '1452.00',
            creditBValue: '0.00',
            category: 'creditsIssuedSales',
            modelYear: {
              name: '2020',
              effectiveDate: '2020-01-01',
              expirationDate: '2020-12-31'
            },
            updateTimestamp: '2023-06-20T16:06:51.828658-07:00'
          },
          {
            creditAValue: '0.00',
            creditBValue: '306.88',
            category: 'creditsIssuedSales',
            modelYear: {
              name: '2019',
              effectiveDate: '2019-01-01',
              expirationDate: '2019-12-31'
            },
            updateTimestamp: '2023-06-20T16:06:51.827015-07:00'
          },
          {
            creditAValue: '2040.00',
            creditBValue: '0.00',
            category: 'provisionalBalance',
            modelYear: {
              name: '2021',
              effectiveDate: '2021-01-01',
              expirationDate: '2021-12-31'
            },
            updateTimestamp: '2023-06-20T16:06:51.825344-07:00'
          },
          {
            creditAValue: '1052.00',
            creditBValue: '0.00',
            category: 'provisionalBalance',
            modelYear: {
              name: '2020',
              effectiveDate: '2020-01-01',
              expirationDate: '2020-12-31'
            },
            updateTimestamp: '2023-06-20T16:06:51.823541-07:00'
          },
          {
            creditAValue: '0.00',
            creditBValue: '306.88',
            category: 'provisionalBalance',
            modelYear: {
              name: '2019',
              effectiveDate: '2019-01-01',
              expirationDate: '2019-12-31'
            },
            updateTimestamp: '2023-06-20T16:06:51.821868-07:00'
          },
          {
            creditAValue: '2040.00',
            creditBValue: '0.00',
            category: 'creditBalanceEnd',
            modelYear: {
              name: '2021',
              effectiveDate: '2021-01-01',
              expirationDate: '2021-12-31'
            },
            updateTimestamp: '2023-06-20T16:06:51.820032-07:00'
          },
          {
            creditAValue: '1052.00',
            creditBValue: '0.00',
            category: 'creditBalanceEnd',
            modelYear: {
              name: '2020',
              effectiveDate: '2020-01-01',
              expirationDate: '2020-12-31'
            },
            updateTimestamp: '2023-06-20T16:06:51.817581-07:00'
          },
          {
            creditAValue: '0.00',
            creditBValue: '306.88',
            category: 'creditBalanceEnd',
            modelYear: {
              name: '2019',
              effectiveDate: '2019-01-01',
              expirationDate: '2019-12-31'
            },
            updateTimestamp: '2023-06-20T16:06:51.749654-07:00'
          },
          {
            creditAValue: '346.00',
            creditBValue: '0.00',
            category: 'creditBalanceStart',
            modelYear: {
              name: '2021',
              effectiveDate: '2021-01-01',
              expirationDate: '2021-12-31'
            },
            updateTimestamp: '2023-06-20T16:06:51.747821-07:00'
          }
        ],
        complianceOffset: null,
        ldvSales: 11000
      },
      ratios: [
        {
          id: 1,
          modelYear: '2019',
          complianceRatio: '0.00',
          zevClassA: '0.00'
        },
        {
          id: 2,
          modelYear: '2020',
          complianceRatio: '9.50',
          zevClassA: '6.00'
        },
        {
          id: 3,
          modelYear: '2021',
          complianceRatio: '12.00',
          zevClassA: '8.00'
        },
        {
          id: 4,
          modelYear: '2022',
          complianceRatio: '14.50',
          zevClassA: '10.00'
        },
        {
          id: 5,
          modelYear: '2023',
          complianceRatio: '17.00',
          zevClassA: '12.00'
        },
        {
          id: 6,
          modelYear: '2024',
          complianceRatio: '19.50',
          zevClassA: '14.00'
        },
        {
          id: 7,
          modelYear: '2025',
          complianceRatio: '22.00',
          zevClassA: '16.00'
        },
        {
          id: 8,
          modelYear: '2026',
          complianceRatio: '32.00',
          zevClassA: '23.00'
        },
        {
          id: 9,
          modelYear: '2027',
          complianceRatio: '41.50',
          zevClassA: '29.00'
        },
        {
          id: 10,
          modelYear: '2028',
          complianceRatio: '51.50',
          zevClassA: '36.00'
        },
        {
          id: 11,
          modelYear: '2029',
          complianceRatio: '61.00',
          zevClassA: '43.00'
        },
        {
          id: 12,
          modelYear: '2030',
          complianceRatio: '71.00',
          zevClassA: '50.00'
        },
        {
          id: 13,
          modelYear: '2031',
          complianceRatio: '90.00',
          zevClassA: '63.00'
        },
        {
          id: 14,
          modelYear: '2032',
          complianceRatio: '108.50',
          zevClassA: '77.00'
        },
        {
          id: 15,
          modelYear: '2033',
          complianceRatio: '127.50',
          zevClassA: '90.00'
        },
        {
          id: 16,
          modelYear: '2034',
          complianceRatio: '146.00',
          zevClassA: '104.00'
        },
        {
          id: 17,
          modelYear: '2035',
          complianceRatio: '165.00',
          zevClassA: '117.00'
        },
        {
          id: 18,
          modelYear: '2036',
          complianceRatio: '184.00',
          zevClassA: '130.00'
        },
        {
          id: 19,
          modelYear: '2037',
          complianceRatio: '203.00',
          zevClassA: '144.00'
        },
        {
          id: 20,
          modelYear: '2038',
          complianceRatio: '221.50',
          zevClassA: '157.00'
        },
        {
          id: 21,
          modelYear: '2039',
          complianceRatio: '240.50',
          zevClassA: '171.00'
        },
        {
          id: 22,
          modelYear: '2040',
          complianceRatio: '259.00',
          zevClassA: '181.00'
        }
      ],
      assessment: {
        assessmentComment: [
          {
            id: 2,
            comment: '<p>yyyyyyy</p>',
            createTimestamp: '2023-07-24T12:19:43.404431-07:00',
            updateTimestamp: '2023-07-24T12:19:43.404454-07:00',
            createUser: {
              id: 443,
              firstName: 'James',
              lastName: 'Donald',
              email: 'james.donald@gov.bc.ca',
              displayName: 'James Donald',
              isActive: true,
              phone: null,
              roles: [
                {
                  id: 1,
                  roleCode: 'Administrator',
                  description: 'can add and manage idir users and assign roles',
                  permissions: [
                    {
                      id: 11,
                      permissionCode: 'ASSIGN_IDIR_ROLES',
                      name: 'Assign IDIR Roles',
                      description: 'can assign roles to government (IDIR) users'
                    },
                    {
                      id: 10,
                      permissionCode: 'DELETE_USERS',
                      name: 'Delete Users',
                      description: 'can hide/disable users'
                    },
                    {
                      id: 8,
                      permissionCode: 'CREATE_USERS',
                      name: 'Create Users',
                      description: 'can create new users'
                    },
                    {
                      id: 4,
                      permissionCode: 'CREATE_ORGANIZATIONS',
                      name: 'Create Organizations',
                      description: 'can create new organizations'
                    },
                    {
                      id: 6,
                      permissionCode: 'DELETE_ORGANIZATIONS',
                      name: 'Delete Organizations',
                      description: 'can hide/disable organizations'
                    },
                    {
                      id: 3,
                      permissionCode: 'VIEW_ORGANIZATIONS',
                      name: 'View Organizations',
                      description: 'can view organization information'
                    },
                    {
                      id: 12,
                      permissionCode: 'ASSIGN_BCEID_ROLES',
                      name: 'Assign BCeID Roles',
                      description: 'can assign roles to external (BCeID) users'
                    },
                    {
                      id: 7,
                      permissionCode: 'VIEW_USERS',
                      name: 'View Users',
                      description: 'can view user information'
                    },
                    {
                      id: 9,
                      permissionCode: 'EDIT_USERS',
                      name: 'Edit Users',
                      description: 'can edit user information'
                    },
                    {
                      id: 5,
                      permissionCode: 'EDIT_ORGANIZATIONS',
                      name: 'Edit Organizations',
                      description: 'can edit organization information'
                    },
                    {
                      id: 2,
                      permissionCode: 'VIEW_ROLES_AND_PERMISSIONS',
                      name: 'View Roles and Permissions',
                      description: 'can view roles and permissions information'
                    },
                    {
                      id: 1,
                      permissionCode: 'VIEW_DASHBOARD',
                      name: 'View Dashboard',
                      description: 'can view dashboard tasks and reports filtered by user role'
                    }
                  ],
                  isGovernmentRole: true
                },
                {
                  id: 2,
                  roleCode: 'Director',
                  description: 'can provide statutory decisions to issue, record and/or approve Credit Applications and Transfers',
                  permissions: [
                    {
                      id: 64,
                      permissionCode: 'REJECT_CREDIT_TRANSFER',
                      name: 'Reject Credit Transfer',
                      description: 'Can reject credit transfers'
                    },
                    {
                      id: 7,
                      permissionCode: 'VIEW_USERS',
                      name: 'View Users',
                      description: 'can view user information'
                    },
                    {
                      id: 17,
                      permissionCode: 'VIEW_CREDIT_TRANSFERS',
                      name: 'View Credit Transfers',
                      description: 'can view credit transfers'
                    },
                    {
                      id: 13,
                      permissionCode: 'VIEW_ZEV',
                      name: 'View ZEV',
                      description: 'can view ZEV model information'
                    },
                    {
                      id: 27,
                      permissionCode: 'SIGN_PURCHASE_REQUESTS',
                      name: 'Sign Purchase Requests',
                      description: 'can approve and sign a purchase requests'
                    },
                    {
                      id: 18,
                      permissionCode: 'SIGN_CREDIT_TRANSFERS',
                      name: 'Sign Credit Transfers',
                      description: 'can approve and sign a credit transfers'
                    },
                    {
                      id: 28,
                      permissionCode: 'DECLINE_PURCHASE_REQUESTS',
                      name: 'Decline Purchase Requests',
                      description: 'can decline to approve a purchase requests'
                    },
                    {
                      id: 22,
                      permissionCode: 'REJECT_COMPLIANCE_REPORT',
                      name: 'Reject Compliance Report',
                      description: 'can reject a compliance report'
                    },
                    {
                      id: 14,
                      permissionCode: 'VIEW_SALES',
                      name: 'View Sales',
                      description: 'can view sales submissions for early credits'
                    },
                    {
                      id: 29,
                      permissionCode: 'VIEW_FILE_SUBMISSIONS',
                      name: 'View File Submissions',
                      description: 'can view and download files that have been uploaded'
                    },
                    {
                      id: 3,
                      permissionCode: 'VIEW_ORGANIZATIONS',
                      name: 'View Organizations',
                      description: 'can view organization information'
                    },
                    {
                      id: 24,
                      permissionCode: 'SIGN_INITIATIVE_AGREEMENTS',
                      name: 'Sign Initiative Agreements',
                      description: 'can approve and sign an initiative agreements'
                    },
                    {
                      id: 25,
                      permissionCode: 'DECLINE_INITIATIVE_AGREEMENTS',
                      name: 'Decline Initiative Agreements',
                      description: 'can decline to approve an initiative agreements'
                    },
                    {
                      id: 23,
                      permissionCode: 'VIEW_INITIATIVE_AGREEMENTS',
                      name: 'View Initiative Agreements',
                      description: 'can view initiative agreements'
                    },
                    {
                      id: 16,
                      permissionCode: 'DECLINE_SALES',
                      name: 'Decline Sales',
                      description: 'can decline to approve a sales submission for early credits'
                    },
                    {
                      id: 26,
                      permissionCode: 'VIEW_PURCHASE_REQUESTS',
                      name: 'View Purchase Requests',
                      description: 'can view credit purchase requests'
                    },
                    {
                      id: 20,
                      permissionCode: 'VIEW_COMPLIANCE_REPORTS',
                      name: 'View Compliance Reports',
                      description: 'can view compliance reports'
                    },
                    {
                      id: 1,
                      permissionCode: 'VIEW_DASHBOARD',
                      name: 'View Dashboard',
                      description: 'can view dashboard tasks and reports filtered by user role'
                    },
                    {
                      id: 21,
                      permissionCode: 'SIGN_COMPLIANCE_REPORT',
                      name: 'Sign Compliance Report',
                      description: 'can accept and sign a compliance report'
                    },
                    {
                      id: 15,
                      permissionCode: 'SIGN_SALES',
                      name: 'Sign Sales',
                      description: 'can approve and sign a sales submission for early credits'
                    },
                    {
                      id: 19,
                      permissionCode: 'DECLINE_CREDIT_TRANSFERS',
                      name: 'Decline Credit Transfers',
                      description: 'can decline to approve a credit transfers'
                    }
                  ],
                  isGovernmentRole: true
                }
              ],
              isMapped: true
            },
            toDirector: true
          },
          {
            id: 1,
            comment: '<p>xxxxx</p>',
            createTimestamp: '2023-07-24T12:19:21.006948-07:00',
            updateTimestamp: '2023-07-24T12:19:21.006977-07:00',
            createUser: {
              id: 443,
              firstName: 'James',
              lastName: 'Donald',
              email: 'james.donald@gov.bc.ca',
              displayName: 'James Donald',
              isActive: true,
              phone: null,
              roles: [
                {
                  id: 1,
                  roleCode: 'Administrator',
                  description: 'can add and manage idir users and assign roles',
                  permissions: [
                    {
                      id: 11,
                      permissionCode: 'ASSIGN_IDIR_ROLES',
                      name: 'Assign IDIR Roles',
                      description: 'can assign roles to government (IDIR) users'
                    },
                    {
                      id: 10,
                      permissionCode: 'DELETE_USERS',
                      name: 'Delete Users',
                      description: 'can hide/disable users'
                    },
                    {
                      id: 8,
                      permissionCode: 'CREATE_USERS',
                      name: 'Create Users',
                      description: 'can create new users'
                    },
                    {
                      id: 4,
                      permissionCode: 'CREATE_ORGANIZATIONS',
                      name: 'Create Organizations',
                      description: 'can create new organizations'
                    },
                    {
                      id: 6,
                      permissionCode: 'DELETE_ORGANIZATIONS',
                      name: 'Delete Organizations',
                      description: 'can hide/disable organizations'
                    },
                    {
                      id: 3,
                      permissionCode: 'VIEW_ORGANIZATIONS',
                      name: 'View Organizations',
                      description: 'can view organization information'
                    },
                    {
                      id: 12,
                      permissionCode: 'ASSIGN_BCEID_ROLES',
                      name: 'Assign BCeID Roles',
                      description: 'can assign roles to external (BCeID) users'
                    },
                    {
                      id: 7,
                      permissionCode: 'VIEW_USERS',
                      name: 'View Users',
                      description: 'can view user information'
                    },
                    {
                      id: 9,
                      permissionCode: 'EDIT_USERS',
                      name: 'Edit Users',
                      description: 'can edit user information'
                    },
                    {
                      id: 5,
                      permissionCode: 'EDIT_ORGANIZATIONS',
                      name: 'Edit Organizations',
                      description: 'can edit organization information'
                    },
                    {
                      id: 2,
                      permissionCode: 'VIEW_ROLES_AND_PERMISSIONS',
                      name: 'View Roles and Permissions',
                      description: 'can view roles and permissions information'
                    },
                    {
                      id: 1,
                      permissionCode: 'VIEW_DASHBOARD',
                      name: 'View Dashboard',
                      description: 'can view dashboard tasks and reports filtered by user role'
                    }
                  ],
                  isGovernmentRole: true
                },
                {
                  id: 2,
                  roleCode: 'Director',
                  description: 'can provide statutory decisions to issue, record and/or approve Credit Applications and Transfers',
                  permissions: [
                    {
                      id: 64,
                      permissionCode: 'REJECT_CREDIT_TRANSFER',
                      name: 'Reject Credit Transfer',
                      description: 'Can reject credit transfers'
                    },
                    {
                      id: 7,
                      permissionCode: 'VIEW_USERS',
                      name: 'View Users',
                      description: 'can view user information'
                    },
                    {
                      id: 17,
                      permissionCode: 'VIEW_CREDIT_TRANSFERS',
                      name: 'View Credit Transfers',
                      description: 'can view credit transfers'
                    },
                    {
                      id: 13,
                      permissionCode: 'VIEW_ZEV',
                      name: 'View ZEV',
                      description: 'can view ZEV model information'
                    },
                    {
                      id: 27,
                      permissionCode: 'SIGN_PURCHASE_REQUESTS',
                      name: 'Sign Purchase Requests',
                      description: 'can approve and sign a purchase requests'
                    },
                    {
                      id: 18,
                      permissionCode: 'SIGN_CREDIT_TRANSFERS',
                      name: 'Sign Credit Transfers',
                      description: 'can approve and sign a credit transfers'
                    },
                    {
                      id: 28,
                      permissionCode: 'DECLINE_PURCHASE_REQUESTS',
                      name: 'Decline Purchase Requests',
                      description: 'can decline to approve a purchase requests'
                    },
                    {
                      id: 22,
                      permissionCode: 'REJECT_COMPLIANCE_REPORT',
                      name: 'Reject Compliance Report',
                      description: 'can reject a compliance report'
                    },
                    {
                      id: 14,
                      permissionCode: 'VIEW_SALES',
                      name: 'View Sales',
                      description: 'can view sales submissions for early credits'
                    },
                    {
                      id: 29,
                      permissionCode: 'VIEW_FILE_SUBMISSIONS',
                      name: 'View File Submissions',
                      description: 'can view and download files that have been uploaded'
                    },
                    {
                      id: 3,
                      permissionCode: 'VIEW_ORGANIZATIONS',
                      name: 'View Organizations',
                      description: 'can view organization information'
                    },
                    {
                      id: 24,
                      permissionCode: 'SIGN_INITIATIVE_AGREEMENTS',
                      name: 'Sign Initiative Agreements',
                      description: 'can approve and sign an initiative agreements'
                    },
                    {
                      id: 25,
                      permissionCode: 'DECLINE_INITIATIVE_AGREEMENTS',
                      name: 'Decline Initiative Agreements',
                      description: 'can decline to approve an initiative agreements'
                    },
                    {
                      id: 23,
                      permissionCode: 'VIEW_INITIATIVE_AGREEMENTS',
                      name: 'View Initiative Agreements',
                      description: 'can view initiative agreements'
                    },
                    {
                      id: 16,
                      permissionCode: 'DECLINE_SALES',
                      name: 'Decline Sales',
                      description: 'can decline to approve a sales submission for early credits'
                    },
                    {
                      id: 26,
                      permissionCode: 'VIEW_PURCHASE_REQUESTS',
                      name: 'View Purchase Requests',
                      description: 'can view credit purchase requests'
                    },
                    {
                      id: 20,
                      permissionCode: 'VIEW_COMPLIANCE_REPORTS',
                      name: 'View Compliance Reports',
                      description: 'can view compliance reports'
                    },
                    {
                      id: 1,
                      permissionCode: 'VIEW_DASHBOARD',
                      name: 'View Dashboard',
                      description: 'can view dashboard tasks and reports filtered by user role'
                    },
                    {
                      id: 21,
                      permissionCode: 'SIGN_COMPLIANCE_REPORT',
                      name: 'Sign Compliance Report',
                      description: 'can accept and sign a compliance report'
                    },
                    {
                      id: 15,
                      permissionCode: 'SIGN_SALES',
                      name: 'Sign Sales',
                      description: 'can approve and sign a sales submission for early credits'
                    },
                    {
                      id: 19,
                      permissionCode: 'DECLINE_CREDIT_TRANSFERS',
                      name: 'Decline Credit Transfers',
                      description: 'can decline to approve a credit transfers'
                    }
                  ],
                  isGovernmentRole: true
                }
              ],
              isMapped: true
            },
            toDirector: false
          }
        ],
        assessment: {
          decision: {
            description: '{user.organization.name} has complied with section 10 (2) of the Zero-Emission Vehicles Act for the {modelYear} model year.',
            id: 1
          },
          penalty: null,
          deficit: '',
          inCompliance: ''
        },
        descriptions: [
          {
            id: 1,
            description: '{user.organization.name} has complied with section 10 (2) of the Zero-Emission Vehicles Act for the {modelYear} model year.',
            displayOrder: 0
          },
          {
            id: 2,
            description: '{user.organization.name} has not complied with section 10 (2) of the Zero-Emission Vehicles Act for the {modelYear} model year. Section 10 (3) does not apply as {user.organization.name} did not have a balance at the end of the compliance date for the previous model year that contained less than zero ZEV units of the same vehicle class and any ZEV class.',
            displayOrder: 1
          },
          {
            id: 3,
            description: '{user.organization.name} ​​​​​​​has not complied with section 10 (2) of the Zero-Emission Vehicles Act for the {modelYear} model year. ​​Section 10 (3) applies and {user.organization.name} is subject to an automatic administrative penalty of {penalty}, as determined under section 26 of the Act. {user.organization.name} is required to pay the administrative penalty within the time period set out in in section 28 of the Act.',
            displayOrder: 2
          }
        ]
      }
    }
    jest.spyOn(ReactRouter, 'useParams').mockReturnValue({
      id: reportId,
      supplementaryId
    })
    jest.spyOn(axios, 'get').mockImplementation((url) => {
      return Promise.resolve({ data: getDataByUrl(url, data, reportId, supplementaryId) })
    })
    const user = { ...baseUser }
    const props = { ...baseProps, user }
    await act(async () => {
      render(
        <Router>
          <SupplementaryContainer
            {...props}
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

  test('state is updated when an input is changed (when under the SupplementaryCreate view)', async () => {
    const inputTestId = 'test-input'
    const mockSupplementaryCreatePropsTracker = jest.fn()
    jest.spyOn(SupplementaryCreate, 'default').mockImplementation((props) => {
      mockSupplementaryCreatePropsTracker(props)
      return <input data-testid={inputTestId} onChange={props.handleInputChange}></input>
    })
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
    const input = screen.getByTestId(inputTestId)
    const testId = 'testId'
    const testName = 'testName'
    const testValue = 'testValue'
    await act(async () => {
      fireEvent.change(input, { target: { id: testId, name: testName, value: testValue } })
    })
    expect(mockSupplementaryCreatePropsTracker).toHaveBeenCalledWith(
      expect.objectContaining({
        newData: expect.objectContaining({
          testName: { testId: testValue }
        })
      })
    )
  })
})
