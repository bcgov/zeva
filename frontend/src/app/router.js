import React from 'react';
import { Route, Switch } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import PageLayout from './PageLayout';
import DashboardContainer from '../dashboard/DashboardContainer';
import OrganizationDetailsContainer from '../organizations/OrganizationDetailsContainer';
import OrganizationDetails from './components/OrganizationDetails';

const Router = (props) => {
  const { keycloak } = props;

  return (
    <BrowserRouter>
      <PageLayout keycloak={keycloak}>
        <Switch>
          <Route
            exact
            path="/"
            render={() => <DashboardContainer />}
          />
        </Switch>

        <Switch>
          <Route
            exact
            path="/organization-details"
            render={() => <OrganizationDetailsContainer keycloak={keycloak} />}
          />
          <Route
            exact
            path="/organizations/mine"
            render={() => <OrganizationDetails keycloak={keycloak} />}
          />
        </Switch>
      </PageLayout>
    </BrowserRouter>
  );
};

Router.propTypes = {
  keycloak: PropTypes.shape().isRequired,
};

export default Router;
