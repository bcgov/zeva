import React from 'react';
import {Route, Switch, withRouter} from 'react-router';

import PageLayout from './PageLayout';
import TransactionList from "./components/TransactionList";
import {BrowserRouter} from "react-router-dom";

const Router = props => (
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
