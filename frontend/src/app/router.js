import axios from 'axios';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Switch } from 'react-router';
import { Route, Router as BrowserRouter } from 'react-router-dom';
import DashboardContainer from '../dashboard/DashboardContainer';
import OrganizationDetailsContainer from '../organizations/OrganizationDetailsContainer';
import OrganizationListContainer from '../organizations/OrganizationListContainer';
import UserDetailsContainer from '../organizations/UserDetailsContainer';
import VehicleSupplierDetailsContainer from '../organizations/VehicleSupplierDetailsContainer';
import RoleListContainer from '../roles/RoleListContainer';
import SalesDetailsContainer from '../sales/SalesDetailsContainer';
import SalesSubmissionContainer from '../sales/SalesSubmissionContainer';
import SalesListContainer from '../sales/SalesListContainer';
import VehicleAddContainer from '../vehicles/VehicleAddContainer';
import VehicleDetailsContainer from '../vehicles/VehicleDetailsContainer';
import VehicleEditContainer from '../vehicles/VehicleEditContainer';
import VehicleListContainer from '../vehicles/VehicleListContainer';
import ErrorHandler from './components/ErrorHandler';
import Loading from './components/Loading';
import StatusInterceptor from './components/StatusInterceptor';

import CONFIG from './config';
import History from './History';
import PageLayout from './PageLayout';
import ROUTES_ORGANIZATIONS from './routes/Organizations';
import ROUTES_ROLES from './routes/Roles';
import ROUTES_SALES from './routes/Sales';
import ROUTES_USERS from './routes/Users';
import ROUTES_VEHICLES from './routes/Vehicles';

class Router extends Component {
  constructor(props) {
    super(props);

    this.state = {
      getUserError: false,
      loading: true,
      user: {},
    };

    const { keycloak } = props;
    const { token } = keycloak;

    axios.defaults.baseURL = CONFIG.APIBASE;
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    axios.interceptors.request.use(async (_config) => {
      const config = _config;

      // only refresh the token, when it's expired
      if (!keycloak.isTokenExpired()) {
        return config;
      }

      await keycloak.updateToken().then((refreshed) => {
        if (refreshed) {
          const { token: newToken } = keycloak;

          config.headers.Authorization = `Bearer ${newToken}`; // update the token for the current request
          axios.defaults.headers.common.Authorization = `Bearer ${newToken}`; // update the token for the succeeding requests
        }
      }).catch(() => {
        props.logout(); // show sign in page if we can't refresh the token
      });

      return config;
    });
  }

  componentDidMount() {
    axios.get(ROUTES_USERS.ME).then((response) => {
      this.setState({
        loading: false,
        user: {
          ...response.data,
        },
      });
    }).catch((error) => {
      this.setState({
        loading: false,
        getUserError: {
          statusCode: error.response.status,
        },
      });
    });
  }

  render() {
    const { keycloak } = this.props;
    const { getUserError, loading, user } = this.state;

    if (loading) {
      return <Loading />;
    }

    if (getUserError) {
      return <StatusInterceptor statusCode={getUserError.statusCode} />;
    }

    return (
      <BrowserRouter history={History}>
        <PageLayout keycloak={keycloak} user={user}>
          <ErrorHandler>
            <Switch>
              <Route
                exact
                path={ROUTES_ORGANIZATIONS.MINE}
                render={() => <OrganizationDetailsContainer keycloak={keycloak} user={user} />}
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
                exact
                path={ROUTES_SALES.ADD}
                render={() => <SalesSubmissionContainer mode="add" keycloak={keycloak} user={user} />}
              />
              <Route
                exact
                path={ROUTES_SALES.DETAILS}
                render={() => <SalesDetailsContainer keycloak={keycloak} user={user} />}
              />
              <Route
                exact
                path={ROUTES_SALES.LIST}
                render={() => <SalesListContainer keycloak={keycloak} user={user} />}
              />

              <Route
                exact
                path={ROUTES_VEHICLES.ADD}
                render={() => <VehicleAddContainer keycloak={keycloak} user={user} />}
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
                exact
                path={ROUTES_ROLES.LIST}
                render={() => <RoleListContainer keycloak={keycloak} user={user} />}
              />
              <Route
                path={ROUTES_USERS.DETAILS}
                render={() => <UserDetailsContainer keycloak={keycloak} user={user} />}
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
