/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';

import Loading from '../app/components/Loading';
import CreditTransactionTabs from '../app/components/CreditTransactionTabs';
import ROUTES_CREDITS from '../app/routes/Credits';

import CustomPropTypes from '../app/utilities/props';
import CreditBalancePage from './components/CreditBalancePage';

const CreditBalanceContainer = (props) => {
  const { user } = props;
  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState([]);

  const refreshList = (showLoading) => {
    setLoading(showLoading);

    axios.get(ROUTES_CREDITS.CREDIT_BALANCES).then((response) => {
      setBalances(response.data);
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
    <CreditTransactionTabs active="credit-transactions" key="tabs" user={user} />,
    <CreditBalancePage
      key="page"
      balances={balances}
      user={user}
    />,
  ]);
};

CreditBalanceContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};

export default CreditBalanceContainer;
