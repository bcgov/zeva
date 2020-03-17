/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';

import Loading from '../app/components/Loading';
import CreditTransactionTabs from '../app/components/CreditTransactionTabs';
import ROUTES_SALES_SUBMISSIONS from '../app/routes/SalesSubmissions';

import CustomPropTypes from '../app/utilities/props';
import SalesListPage from './components/SalesListPage';

const SalesListContainer = (props) => {
  const { user } = props;
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshList = (showLoading) => {
    setLoading(showLoading);

    axios.get(ROUTES_SALES_SUBMISSIONS.LIST).then((response) => {
      setSubmissions(response.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshList(true);
  }, []);


  if (loading) {
    return (<Loading />);
  }

  return ([
    <CreditTransactionTabs active="credit-transactions" key="tabs" />,
    <SalesListPage
      key="page"
      submissions={submissions}
      user={user}
    />,
  ]);
};

SalesListContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};

export default SalesListContainer;
