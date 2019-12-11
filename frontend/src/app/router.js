import React from 'react';
import { Route, Switch } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import PageLayout from './PageLayout';
import TransactionList from './components/TransactionList';

const Router = (props) => (
  <BrowserRouter>
    <PageLayout keycloak={props.keycloak}>
      <Switch>
        <Route
          exact
          path="/"
          render={() => <TransactionList keycloak={props.keycloak} />}
        />
      </Switch>
    </PageLayout>
  </BrowserRouter>
);

Router.propTypes = {
  keycloak: PropTypes.shape().isRequired,
};

export default Router;
