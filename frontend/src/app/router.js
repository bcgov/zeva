import React, { Component } from 'react';
import { Route, Switch } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';

import Loading from './components/Loading';
import CONFIG from './config';
import PageLayout from './PageLayout';
import DashboardContainer from '../dashboard/DashboardContainer';
import OrganizationDetailsContainer from '../organizations/OrganizationDetailsContainer';

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
    axios.get('users/current').then((response) => {
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
      <BrowserRouter>
        <PageLayout keycloak={keycloak} user={user}>
          <Switch>
            <Route
              exact
              path="/"
              render={() => <DashboardContainer user={user} />}
            />
          </Switch>

          <Switch>
            <Route
              exact
              path="/organization-details"
              render={() => <OrganizationDetailsContainer keycloak={keycloak} user={user} />}
            />
            <Route
              exact
              path="/organizations/mine"
              render={() => <OrganizationDetailsContainer keycloak={keycloak} user={user} />}
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
