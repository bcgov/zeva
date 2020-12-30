import axios from 'axios';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Switch } from 'react-router';
import { Route, Redirect, Router as BrowserRouter } from 'react-router-dom';

import DashboardContainer from '../dashboard/DashboardContainer';
import OrganizationDetailsContainer from '../organizations/OrganizationDetailsContainer';
import OrganizationListContainer from '../organizations/OrganizationListContainer';
import NotificationListContainer from '../notifications/NotificationListContainer';
import VehicleSupplierCreditTransactionListContainer from '../organizations/VehicleSupplierCreditTransactionListContainer';
import VehicleSupplierDetailsContainer from '../organizations/VehicleSupplierDetailsContainer';
import VehicleSupplierEditContainer from '../organizations/VehicleSupplierEditContainer';
import VehicleSupplierModelListContainer from '../organizations/VehicleSupplierModelListContainer';
import VehicleSupplierUserListContainer from '../organizations/VehicleSupplierUserListContainer';
import CreditsContainer from '../credits/CreditsContainer';
import CreditRequestListContainer from '../credits/CreditRequestListContainer';
import CreditTransfersEditContainer from '../credits/CreditTransfersEditContainer';
import CreditTransferListContainer from '../credits/CreditTransferListContainer';
import CreditRequestDetailsContainer from '../credits/CreditRequestDetailsContainer';
import CreditTransfersDetailsContainer from '../credits/CreditTransfersDetailsContainer';
import CreditRequestVINListContainer from '../credits/CreditRequestVINListContainer';
import UploadCreditRequestContainer from '../credits/UploadCreditRequestContainer';
import UploadCreditRequestConfirmationContainer from '../credits/UploadCreditRequestConfirmationContainer';
import UploadICBCVerificationContainer from '../credits/UploadICBCVerificationContainer';
import UserEditContainer from '../users/UserEditContainer';
import VehicleDetailsContainer from '../vehicles/VehicleDetailsContainer';
import VehicleEditContainer from '../vehicles/VehicleEditContainer';
import VehicleListContainer from '../vehicles/VehicleListContainer';
import ErrorHandler from './components/ErrorHandler';
import Loading from './components/Loading';
import StatusInterceptor from './components/StatusInterceptor';

import CONFIG from './config';
import History from './History';
import PageLayout from './PageLayout';
import ROUTES_CREDIT_REQUESTS from './routes/CreditRequests';
import ROUTES_CREDIT_TRANSFERS from './routes/CreditTransfers';
import ROUTES_CREDITS from './routes/Credits';
import ROUTES_ORGANIZATIONS from './routes/Organizations';
import ROUTES_NOTIFICATIONS from './routes/Notifications';
import ROUTES_USERS from './routes/Users';
import ROUTES_VEHICLES from './routes/Vehicles';

class Router extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      statusCode: null,
      user: {},
    };

    const { keycloak } = props;
    const { token } = keycloak;

    axios.defaults.baseURL = CONFIG.APIBASE;
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    axios.interceptors.response.use(
      (response) => (response),
      (error) => {
        if (error.response && error.response.status >= 400) {
          this.setState({
            loading: false,
            statusCode: error.response.status,
          });
        }

        throw error;
      },
    );

    keycloak.onTokenExpired = () => {
      keycloak.updateToken(5).then((refreshed) => {
        if (refreshed) {
          const { token: newToken } = keycloak;

          axios.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        }
      }).catch(() => {
        props.logout();
      });
    };
  }

  componentDidMount() {
    axios.get(ROUTES_USERS.ME).then((response) => {
      this.setState({
        loading: false,
        user: {
          ...response.data,
          hasPermission: (permissionCode) => {
            if (response.data) {
              const { permissions } = response.data;

              if (permissions) {
                return permissions.findIndex((permission) => (
                  permission.permissionCode === permissionCode
                )) >= 0;
              }
            }

            return false;
          },
        },
      });
    });
  }

  render() {
    const { keycloak } = this.props;
    const { loading, statusCode, user } = this.state;

    if (loading) {
      return <Loading />;
    }

    return (
      <BrowserRouter history={History}>
        <PageLayout keycloak={keycloak} user={user}>
          <ErrorHandler statusCode={statusCode}>
            <Switch>
              <Route
                exact
                path={ROUTES_ORGANIZATIONS.MINE_ADD_USER}
                render={() => <UserEditContainer keycloak={keycloak} user={user} newUser />}
              />
              <Route
                exact
                path={ROUTES_ORGANIZATIONS.MINE}
                render={() => <OrganizationDetailsContainer keycloak={keycloak} user={user} />}
              />
              <Route
                path={ROUTES_ORGANIZATIONS.NEW}
                render={() => (
                  <VehicleSupplierEditContainer keycloak={keycloak} user={user} newSupplier />
                )}
              />
              <Route
                path={ROUTES_ORGANIZATIONS.ADD_USER}
                render={() => <UserEditContainer keycloak={keycloak} user={user} newUser />}
              />
              <Route
                path={ROUTES_ORGANIZATIONS.USERS}
                render={() => <VehicleSupplierUserListContainer keycloak={keycloak} user={user} />}
              />
              <Route
                path={ROUTES_ORGANIZATIONS.VEHICLES}
                render={() => <VehicleSupplierModelListContainer keycloak={keycloak} user={user} />}
              />
              <Route
                path={ROUTES_ORGANIZATIONS.TRANSACTIONS}
                render={() => (
                  <VehicleSupplierCreditTransactionListContainer keycloak={keycloak} user={user} />
                )}
              />
              <Route
                path={ROUTES_ORGANIZATIONS.EDIT}
                render={() => (typeof user.hasPermission === 'function'&& user.hasPermission('EDIT_ORGANIZATIONS') && user.isGovernment)  ? 
                <VehicleSupplierEditContainer keycloak={keycloak} user={user} /> : (
                <Redirect
                  to={{
                    path: "/"}}/>
                )}
              />
              <Route
                path={ROUTES_ORGANIZATIONS.DETAILS}
                render={() => <VehicleSupplierDetailsContainer keycloak={keycloak} user={user} />}
              />
              <Route
                exact
                path={ROUTES_VEHICLES.EDIT}
                render={() => <VehicleEditContainer keycloak={keycloak} user={user} />}
              />
              <Route
                path={ROUTES_ORGANIZATIONS.LIST}
                render={() => <OrganizationListContainer keycloak={keycloak} user={user} />}
              />
              <Route
                path={ROUTES_NOTIFICATIONS.LIST}
                render={() => <NotificationListContainer keycloak={keycloak} user={user} />}
              />
              <Route
                exact
                path={ROUTES_VEHICLES.ADD}
                render={() => <VehicleEditContainer keycloak={keycloak} user={user} newVehicle />}
              />
              <Route
                exact
                path={ROUTES_VEHICLES.LIST}
                render={() => <VehicleListContainer keycloak={keycloak} user={user} />}
              />
              <Route
                exact
                path={ROUTES_VEHICLES.DETAILS}
                render={() => <VehicleDetailsContainer keycloak={keycloak} user={user} />}
              />
              <Route
                path={ROUTES_USERS.EDIT}
                render={() => <UserEditContainer keycloak={keycloak} user={user} />}
              />
              <Route
                exact
                path={ROUTES_CREDITS.LIST}
                render={() => <CreditsContainer keycloak={keycloak} user={user} />}
              />
              <Route
                exact
                path={ROUTES_CREDITS.UPLOAD_VERIFICATION}
                render={() => <UploadICBCVerificationContainer keycloak={keycloak} user={user} />}
              />
              {CONFIG.FEATURES.CREDIT_TRANSFERS.ENABLED && ([
                <Route
                  exact
                  key="route-credit-transfers-list"
                  path={ROUTES_CREDIT_TRANSFERS.LIST}
                  render={() => <CreditTransferListContainer keycloak={keycloak} user={user} />}
                />,
                <Route
                  exact
                  key="route-credit-transfers-new"
                  path={ROUTES_CREDIT_TRANSFERS.NEW}
                  render={() => <CreditTransfersEditContainer keycloak={keycloak} user={user} newTransfer />}
                />,
                <Route
                  exact
                  key="route-credit-transfers-edit"
                  path={ROUTES_CREDIT_TRANSFERS.EDIT}
                  render={() => <CreditTransfersEditContainer keycloak={keycloak} user={user} />}
                />,
                <Route
                  key="route-credit-transfers-details"
                  path={ROUTES_CREDIT_TRANSFERS.DETAILS}
                  render={() => (
                    <CreditTransfersDetailsContainer keycloak={keycloak} user={user} />
                  )}
                />,
              ])}
              <Route
                exact
                path={ROUTES_CREDIT_REQUESTS.NEW}
                render={() => <UploadCreditRequestContainer keycloak={keycloak} user={user} />}
              />
              <Route
                path={ROUTES_CREDIT_REQUESTS.VALIDATED}
                render={() => (
                  <CreditRequestDetailsContainer keycloak={keycloak} user={user} validatedOnly />
                )}
              />
              <Route
                exact
                path={ROUTES_CREDIT_REQUESTS.CONFIRM}
                render={() => <UploadCreditRequestConfirmationContainer keycloak={keycloak} user={user} />}
              />
              <Route
                exact
                path={ROUTES_CREDIT_REQUESTS.EDIT}
                render={() => <UploadCreditRequestContainer keycloak={keycloak} user={user} />}
              />
              <Route
                path={ROUTES_CREDIT_REQUESTS.VALIDATE}
                render={() => <CreditRequestVINListContainer keycloak={keycloak} user={user} />}
              />
              <Route
                path={ROUTES_CREDIT_REQUESTS.DETAILS}
                render={() => <CreditRequestDetailsContainer keycloak={keycloak} user={user} />}
              />
              <Route
                exact
                path={ROUTES_CREDIT_REQUESTS.LIST}
                render={() => <CreditRequestListContainer keycloak={keycloak} user={user} />}
              />
              <Route
                exact
                path="/"
                render={() => <DashboardContainer user={user} />}
              />
              <Route
                path="/"
                render={() => (
                  <StatusInterceptor statusCode={404} />
                )}
              />
            </Switch>
          </ErrorHandler>
        </PageLayout>
      </BrowserRouter>
    );
  }
}

Router.propTypes = {
  keycloak: PropTypes.shape().isRequired,
  logout: PropTypes.func.isRequired,
};

export default Router;
