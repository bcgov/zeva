import React from 'react';
import { Route, Switch } from 'react-router';
import { BrowserRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import PageLayout from './PageLayout';
import TransactionList from './components/TransactionList';

const Router = (props) => {
  const { keycloak } = props;

  return (
    <BrowserRouter>
      <PageLayout keycloak={keycloak}>
        <Switch>
          <Route
            exact
            path="/"
            render={() => <TransactionList keycloak={keycloak} />}
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
