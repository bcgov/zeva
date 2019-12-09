import React from 'react';
import { Route, Switch, withRouter } from 'react-router';
import { BrowserRouter } from 'react-router-dom';

import PageLayout from './PageLayout';
import TransactionList from './components/TransactionList';

const Router = () => (
  <BrowserRouter>
    <PageLayout>
      <Switch>
        <Route
          path="/"
          component={withRouter(TransactionList)}
        />
      </Switch>
    </PageLayout>
  </BrowserRouter>
);


export default Router;
