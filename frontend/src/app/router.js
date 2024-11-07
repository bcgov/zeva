import axios from 'axios'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Switch } from 'react-router'
import { Route, Redirect, Router as BrowserRouter } from 'react-router-dom'
import SessionTimeout from './components/SessionTimeout'

import DashboardContainer from '../dashboard/DashboardContainer'
import OrganizationDetailsContainer from '../organizations/OrganizationDetailsContainer'
import OrganizationListContainer from '../organizations/OrganizationListContainer'
import NotificationListContainer from '../notifications/NotificationListContainer'
import VehicleSupplierCreditTransactionListContainer from '../organizations/VehicleSupplierCreditTransactionListContainer'
import VehicleSupplierDetailsContainer from '../organizations/VehicleSupplierDetailsContainer'
import VehicleSupplierEditContainer from '../organizations/VehicleSupplierEditContainer'
import VehicleSupplierModelListContainer from '../organizations/VehicleSupplierModelListContainer'
import VehicleSupplierReportListContainer from '../organizations/VehicleSupplierReportListContainer'
import VehicleSupplierUserListContainer from '../organizations/VehicleSupplierUserListContainer'
import CreditsContainer from '../credits/CreditsContainer'
import CreditRequestListContainer from '../credits/CreditRequestListContainer'
import CreditTransfersEditContainer from '../credits/CreditTransfersEditContainer'
import CreditTransferListContainer from '../credits/CreditTransferListContainer'
import CreditAgreementListContainer from '../creditagreements/CreditAgreementListContainer'
import CreditRequestDetailsContainer from '../credits/CreditRequestDetailsContainer'
import CreditTransfersDetailsContainer from '../credits/CreditTransfersDetailsContainer'
import CreditRequestVINListContainer from '../credits/CreditRequestVINListContainer'
import CreditRequestValidatedDetailsContainer from '../credits/CreditRequestValidatedDetailsContainer'
import UploadCreditRequestContainer from '../credits/UploadCreditRequestContainer'
import UploadICBCVerificationContainer from '../credits/UploadICBCVerificationContainer'
import UserEditContainer from '../users/UserEditContainer'
import VehicleDetailsContainer from '../vehicles/VehicleDetailsContainer'
import VehicleEditContainer from '../vehicles/VehicleEditContainer'
import VehicleListContainer from '../vehicles/VehicleListContainer'
import ComplianceCalculatorContainer from '../compliance/ComplianceCalculatorContainer'
import ComplianceReportsContainer from '../compliance/ComplianceReportsContainer'
import ComplianceReportSummaryContainer from '../compliance/ComplianceReportSummaryContainer'
import ComplianceRatiosContainer from '../compliance/ComplianceRatiosContainer'
import AssessmentContainer from '../compliance/AssessmentContainer'
import AssessmentEditContainer from '../compliance/AssessmentEditContainer'
import SupplierInformationContainer from '../compliance/SupplierInformationContainer'
import ComplianceObligationContainer from '../compliance/ComplianceObligationContainer'
import ConsumerSalesContainer from '../compliance/ConsumerSalesContainer'
import CreditAgreementsEditContainer from '../creditagreements/CreditAgreementsEditContainer'
import CreditAgreementsDetailsContainer from '../creditagreements/CreditAgreementsDetailsContainer'
import SupplementaryContainer from '../supplementary/SupplementaryContainer'
import ActiveUsersListContainer from '../users/ActiveUsersListContainer'
import ErrorHandler from './components/ErrorHandler'
import Loading from './components/Loading'
import StatusInterceptor from './components/StatusInterceptor'

import CONFIG from './config'
import History from './History'
import PageLayout from './PageLayout'
import ROUTES_CREDIT_REQUESTS from './routes/CreditRequests'
import ROUTES_CREDIT_TRANSFERS from './routes/CreditTransfers'
import ROUTES_CREDIT_AGREEMENTS from './routes/CreditAgreements'
import ROUTES_CREDITS from './routes/Credits'
import ROUTES_ORGANIZATIONS from './routes/Organizations'
import ROUTES_NOTIFICATIONS from './routes/Notifications'
import ROUTES_USERS from './routes/Users'
import ROUTES_VEHICLES from './routes/Vehicles'
import ROUTES_COMPLIANCE from './routes/Compliance'
import ROUTES_SUPPLEMENTARY from './routes/SupplementaryReport'
import Unverified from './components/Unverified'

class Router extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: true,
      statusCode: null,
      user: null
    }

    const { keycloak } = props
    const { token } = keycloak

    axios.defaults.baseURL = CONFIG.API_BASE
    axios.defaults.headers.common.Authorization = `Bearer ${token}`
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status >= 400) {
          this.setState({
            loading: false,
            statusCode: error.response.status
          })
        }

        throw error
      }
    )
  }

  componentDidMount () {
    axios.get(ROUTES_USERS.ME).then((response) => {
      this.setState({
        loading: false,
        user: {
          ...response.data,
          hasPermission: (permissionCode) => {
            if (response.data) {
              const { permissions } = response.data

              if (permissions) {
                return (
                  permissions.findIndex(
                    (permission) => permission.permissionCode === permissionCode
                  ) >= 0
                )
              }
            }
            return false
          }
        }
      })
    })
      .catch((error) => {
        console.log(error)
        this.setState({
          loading: false,
          user: null
        })
      })
  }

  render () {
    const { keycloak, logout } = this.props
    const { loading, statusCode, user } = this.state
    if (loading) {
      return <Loading />
    }

    if (!user) {
      return <Unverified logout={logout} />
    }

    return (
      <BrowserRouter history={History}>
        <PageLayout keycloak={keycloak} user={user} logout={logout}>
          <ErrorHandler statusCode={statusCode}>
            <SessionTimeout keycloak={keycloak} logout={logout} />
            <Switch>
              <Route
                path={ROUTES_USERS.ACTIVE}
                render={() => (
                  <ActiveUsersListContainer keycloak={keycloak} user={user} />
                )}
              />
              <Route
                path={ROUTES_SUPPLEMENTARY.SUPPLEMENTARY_DETAILS}
                render={() => (
                  <SupplementaryContainer keycloak={keycloak} user={user} />
                )}
              />
              <Route
                path={ROUTES_SUPPLEMENTARY.CREATE}
                render={() => (
                  <SupplementaryContainer
                    keycloak={keycloak}
                    user={user}
                    newReport
                  />
                )}
              />
              <Route
                path={ROUTES_SUPPLEMENTARY.REASSESSMENT}
                render={() => (
                  <SupplementaryContainer
                    keycloak={keycloak}
                    user={user}
                    reassessment
                    newReport
                  />
                )}
              />
              <Route
                path={ROUTES_COMPLIANCE.REPORT_ASSESSMENT}
                render={() => (
                  <AssessmentContainer keycloak={keycloak} user={user} />
                )}
              />
              <Route
                path={ROUTES_COMPLIANCE.ASSESSMENT_EDIT}
                render={() => (
                  <AssessmentEditContainer keycloak={keycloak} user={user} />
                )}
              />
              <Route
                path={ROUTES_COMPLIANCE.REPORT_CREDIT_ACTIVITY}
                render={() => (
                  <ComplianceObligationContainer
                    keycloak={keycloak}
                    user={user}
                  />
                )}
              />
              <Route
                path={ROUTES_COMPLIANCE.REPORT_SUPPLIER_INFORMATION}
                render={() => (
                  <SupplierInformationContainer
                    keycloak={keycloak}
                    user={user}
                  />
                )}
              />
              <Route
                exact
                key="route-conpliance-report-new"
                path={ROUTES_COMPLIANCE.NEW}
                render={() => (
                  <SupplierInformationContainer
                    keycloak={keycloak}
                    user={user}
                    newReport
                  />
                )}
              />
              ,
              <Route
                path={ROUTES_COMPLIANCE.REPORT_CONSUMER_SALES}
                render={() => (
                  <ConsumerSalesContainer keycloak={keycloak} user={user} />
                )}
              />
              <Route
                path={ROUTES_COMPLIANCE.CALCULATOR}
                render={() =>
                  typeof user.hasPermission === 'function' &&
                  user.hasPermission('EDIT_SALES') &&
                  !user.isGovernment
                    ? (
                    <ComplianceCalculatorContainer
                      keycloak={keycloak}
                      user={user}
                    />
                      )
                    : (
                    <ComplianceReportsContainer
                      keycloak={keycloak}
                      user={user}
                    />
                      )
                }
              />
              <Route
                path={ROUTES_COMPLIANCE.REPORT_SUMMARY}
                render={() => (
                  <ComplianceReportSummaryContainer
                    keycloak={keycloak}
                    user={user}
                  />
                )}
              />
              <Route
                path={ROUTES_COMPLIANCE.REPORTS}
                render={() => (
                  <ComplianceReportsContainer keycloak={keycloak} user={user} />
                )}
              />
              <Route
                path={ROUTES_COMPLIANCE.RATIOS}
                render={() => (
                  <ComplianceRatiosContainer keycloak={keycloak} user={user} />
                )}
              />
              <Route
                exact
                path={ROUTES_ORGANIZATIONS.MINE_ADD_USER}
                render={() => (
                  <UserEditContainer keycloak={keycloak} user={user} newUser />
                )}
              />
              <Route
                exact
                path={ROUTES_ORGANIZATIONS.MINE}
                render={() => (
                  <OrganizationDetailsContainer
                    keycloak={keycloak}
                    user={user}
                  />
                )}
              />
              <Route
                path={ROUTES_ORGANIZATIONS.NEW}
                render={() => (
                  <VehicleSupplierEditContainer
                    keycloak={keycloak}
                    user={user}
                    newSupplier
                  />
                )}
              />
              <Route
                path={ROUTES_ORGANIZATIONS.ADD_USER}
                render={() => (
                  <UserEditContainer keycloak={keycloak} user={user} newUser />
                )}
              />
              <Route
                path={ROUTES_ORGANIZATIONS.USERS}
                render={() => (
                  <VehicleSupplierUserListContainer
                    keycloak={keycloak}
                    user={user}
                  />
                )}
              />
              <Route
                path={ROUTES_ORGANIZATIONS.REPORTS}
                render={() => (
                  <VehicleSupplierReportListContainer
                    keycloak={keycloak}
                    user={user}
                  />
                )}
              />
              <Route
                path={ROUTES_ORGANIZATIONS.VEHICLES}
                render={() => (
                  <VehicleSupplierModelListContainer
                    keycloak={keycloak}
                    user={user}
                  />
                )}
              />
              <Route
                path={ROUTES_ORGANIZATIONS.TRANSACTIONS}
                render={() => (
                  <VehicleSupplierCreditTransactionListContainer
                    keycloak={keycloak}
                    user={user}
                  />
                )}
              />
              <Route
                path={ROUTES_ORGANIZATIONS.EDIT}
                render={() =>
                  typeof user.hasPermission === 'function' &&
                  user.hasPermission('EDIT_ORGANIZATIONS') &&
                  user.isGovernment
                    ? (
                    <VehicleSupplierEditContainer
                      keycloak={keycloak}
                      user={user}
                    />
                      )
                    : (
                    <Redirect to={{ path: '/' }} />
                      )
                }
              />
              <Route
                path={ROUTES_ORGANIZATIONS.DETAILS}
                render={() => (
                  user.isGovernment
                    && (
                  <VehicleSupplierDetailsContainer
                    keycloak={keycloak}
                    user={user}
                  />
                  )
                )}
              />
              <Route
                exact
                path={ROUTES_VEHICLES.EDIT}
                render={() => (
                  <VehicleEditContainer keycloak={keycloak} user={user} />
                )}
              />
              <Route
                path={ROUTES_ORGANIZATIONS.LIST}
                render={() => (
                  <OrganizationListContainer keycloak={keycloak} user={user} />
                )}
              />
              <Route
                path={ROUTES_NOTIFICATIONS.LIST}
                render={() => (
                  <NotificationListContainer keycloak={keycloak} user={user} />
                )}
              />
              <Route
                exact
                path={ROUTES_VEHICLES.ADD}
                render={() => (
                  <VehicleEditContainer
                    keycloak={keycloak}
                    user={user}
                    newVehicle
                  />
                )}
              />
              <Route
                exact
                path={ROUTES_VEHICLES.LIST}
                render={() => (
                  <VehicleListContainer keycloak={keycloak} user={user} />
                )}
              />
              <Route
                exact
                path={ROUTES_VEHICLES.DETAILS}
                render={() => (
                  <VehicleDetailsContainer keycloak={keycloak} user={user} />
                )}
              />
              <Route
                path={ROUTES_USERS.EDIT}
                render={() => (
                  <UserEditContainer keycloak={keycloak} user={user} />
                )}
              />
              <Route
                exact
                path={ROUTES_CREDITS.LIST}
                render={() => (
                  <CreditsContainer keycloak={keycloak} user={user} />
                )}
              />
              <Route
                exact
                path={ROUTES_CREDITS.UPLOAD_VERIFICATION}
                render={() => (
                  <UploadICBCVerificationContainer
                    keycloak={keycloak}
                    user={user}
                  />
                )}
              />
              {CONFIG.FEATURES.CREDIT_TRANSFERS.ENABLED && [
                <Route
                  exact
                  key="route-credit-transfers-list"
                  path={ROUTES_CREDIT_TRANSFERS.LIST}
                  render={() => (
                    <CreditTransferListContainer
                      keycloak={keycloak}
                      user={user}
                    />
                  )}
                />,
                <Route
                  exact
                  key="route-credit-transfers-new"
                  path={ROUTES_CREDIT_TRANSFERS.NEW}
                  render={() => (
                    <CreditTransfersEditContainer
                      keycloak={keycloak}
                      user={user}
                      newTransfer
                    />
                  )}
                />,
                <Route
                  exact
                  key="route-credit-transfers-edit"
                  path={ROUTES_CREDIT_TRANSFERS.EDIT}
                  render={() => (
                    <CreditTransfersEditContainer
                      keycloak={keycloak}
                      user={user}
                    />
                  )}
                />,
                <Route
                  key="route-credit-transfers-details"
                  path={ROUTES_CREDIT_TRANSFERS.DETAILS}
                  render={() => (
                    <CreditTransfersDetailsContainer
                      keycloak={keycloak}
                      user={user}
                    />
                  )}
                />
              ]}
              <Route
                exact
                path={ROUTES_CREDIT_REQUESTS.NEW}
                render={() => (
                  <UploadCreditRequestContainer
                    keycloak={keycloak}
                    user={user}
                  />
                )}
              />
              <Route
                path={ROUTES_CREDIT_REQUESTS.VALIDATED}
                render={() => (
                  <CreditRequestDetailsContainer
                    keycloak={keycloak}
                    user={user}
                    validatedOnly
                  />
                )}
              />
              <Route
                exact
                path={ROUTES_CREDIT_REQUESTS.EDIT}
                render={() => (
                  <UploadCreditRequestContainer
                    keycloak={keycloak}
                    user={user}
                  />
                )}
              />
              <Route
                path={ROUTES_CREDIT_REQUESTS.VALIDATED_DETAILS}
                render={() => (
                  <CreditRequestValidatedDetailsContainer
                    keycloak={keycloak}
                    user={user}
                  />
                )}
              />
              <Route
                path={ROUTES_CREDIT_REQUESTS.VALIDATE}
                render={() => (
                  <CreditRequestVINListContainer
                    keycloak={keycloak}
                    user={user}
                  />
                )}
              />
              <Route
                path={ROUTES_CREDIT_REQUESTS.DETAILS}
                render={() => (
                  <CreditRequestDetailsContainer
                    keycloak={keycloak}
                    user={user}
                  />
                )}
              />
              <Route
                exact
                path={ROUTES_CREDIT_REQUESTS.LIST}
                render={() => (
                  <CreditRequestListContainer keycloak={keycloak} user={user} />
                )}
              />
              {CONFIG.FEATURES.CREDIT_AGREEMENTS.ENABLED && [
                <Route
                  exact
                  key="route-credit-agreements-list"
                  path={ROUTES_CREDIT_AGREEMENTS.LIST}
                  render={() =>
                    user.isGovernment
                      ? (
                      <CreditAgreementListContainer
                        keycloak={keycloak}
                        user={user}
                      />
                        )
                      : (
                      <></>
                        )
                  }
                />,
                <Route
                  exact
                  key="route-credit-agreements-edit"
                  path={ROUTES_CREDIT_AGREEMENTS.EDIT}
                  render={() =>
                    user.isGovernment
                      ? (
                      <CreditAgreementsEditContainer
                        keycloak={keycloak}
                        user={user}
                      />
                        )
                      : (
                      <></>
                        )
                  }
                />,
                <Route
                  exact
                  key="route-credit-agreements-new"
                  path={ROUTES_CREDIT_AGREEMENTS.NEW}
                  render={() =>
                    user.isGovernment
                      ? (
                      <CreditAgreementsEditContainer
                        keycloak={keycloak}
                        user={user}
                      />
                        )
                      : (
                      <></>
                        )
                  }
                />,
                <Route
                  exact
                  key="route-credit-agreements-details"
                  path={ROUTES_CREDIT_AGREEMENTS.DETAILS}
                  render={() =>
                    <CreditAgreementsDetailsContainer
                      keycloak={keycloak}
                      user={user}
                    />
                  }
                />
              ]}
              <Route
                exact
                path="/"
                render={() => <DashboardContainer user={user} />}
              />
              <Route
                path="/"
                render={() => <StatusInterceptor statusCode={404} />}
              />
            </Switch>
          </ErrorHandler>
        </PageLayout>
      </BrowserRouter>
    )
  }
}

Router.propTypes = {
  keycloak: PropTypes.shape().isRequired,
  logout: PropTypes.func.isRequired
}

export default Router
