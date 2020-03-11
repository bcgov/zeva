/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';

import Loading from '../app/components/Loading';
import CreditTransactionTabs from '../app/components/CreditTransactionTabs';
import ROUTES_SALES from '../app/routes/Sales';

import CustomPropTypes from '../app/utilities/props';
import SalesListPage from './components/SalesListPage';

const SalesListContainer = (props) => {
  const { user } = props;
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshList = (showLoading) => {
    setLoading(showLoading);

    axios.get(ROUTES_SALES.LIST).then((response) => {
      setSales(response.data);
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
      sales={sales}
      user={user}
    />,
  ]);
};

SalesListContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};

export default SalesListContainer;
