import axios from 'axios';
import React, { useEffect, useState } from 'react';

import CreditTransactions from './components/CreditTransactions';
import Loading from '../app/components/Loading';
import CreditTransactionTabs from '../app/components/CreditTransactionTabs';
import ROUTES_CREDITS from '../app/routes/Credits';
import CustomPropTypes from '../app/utilities/props';

const CreditsContainer = (props) => {
  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState([]);
  const [creditTransactions, setCreditTransactions] = useState([]);
  const { user } = props;

  const refreshList = (showLoading) => {
    setLoading(showLoading);
    const balancePromise = axios.get(ROUTES_CREDITS.CREDIT_BALANCES).then((response) => {
      setBalances(response.data);
    });

    const listPromise = axios.get(ROUTES_CREDITS.LIST).then((response) => {
      setCreditTransactions(response.data);
    });

    Promise.all([balancePromise, listPromise]).then(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshList(true);
  }, []);
  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      <div>
        <CreditTransactionTabs active="credit-transactions" key="tabs" user={user} />
        <CreditTransactions balances={balances} items={creditTransactions} user={user} />
      </div>
    </div>
  );
};

CreditsContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};

export default CreditsContainer;
