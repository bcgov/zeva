import React, { Component } from 'react';
import { Switch } from 'react-router';
import { Router as BrowserRouter, Route } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';

import Loading from './components/Loading';
import CONFIG from './config';
import History from './History';
import PageLayout from './PageLayout';
import DashboardContainer from '../dashboard/DashboardContainer';
import OrganizationDetailsContainer from '../organizations/OrganizationDetailsContainer';
import OrganizationListContainer from '../organizations/OrganizationListContainer';
import ROUTES_ORGANIZATIONS from './routes/Organizations';
import ROUTES_USERS from './routes/Users';
import ROUTES_VEHICLES from './routes/Vehicles';
import VehicleAddContainer from '../vehicles/VehicleAddContainer';
import VehicleSupplierDetailsContainer from '../organizations/VehicleSupplierDetailsContainer';
import VehicleListContainer from '../vehicles/VehicleListContainer';
import VehicleDetailContainer from '../vehicles/VehicleDetailContainer';

class Router extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      user: {},
    };

    const { keycloak } = props;
    const { token } = keycloak;

    axios.defaults.baseURL = CONFIG.APIBASE;
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  componentDidMount() {
    axios.get(ROUTES_USERS.ME).then((response) => {
      this.setState({
        loading: false,
        user: {
          ...response.data,
        },
      });
    });
  }

  render() {
    const { keycloak } = this.props;
    const { loading, user } = this.state;

    if (loading) {
      return <Loading />;
    }

    return (
      <BrowserRouter history={History}>
        <PageLayout keycloak={keycloak} user={user}>
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
              path={ROUTES_ORGANIZATIONS.LIST}
              render={() => <OrganizationListContainer keycloak={keycloak} user={user} />}
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
              render={() => <VehicleDetailContainer keycloak={keycloak} user={user} />}
            />
            <Route
              exact
              path="/"
              render={() => <DashboardContainer user={user} />}
            />
          </Switch>
        </PageLayout>
      </BrowserRouter>
    );
  }
}

Router.propTypes = {
  keycloak: PropTypes.shape().isRequired,
};

export default Router;
