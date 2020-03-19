import axios from 'axios';
import React, { useEffect, useState } from 'react';
import CreditTransactions from './components/CreditTransactions';
import Loading from '../app/components/Loading';
import CreditTransactionTabs from '../app/components/CreditTransactionTabs';
import ROUTES_CREDITS from '../app/routes/Credits'


const CreditsContainer = (props) => {
  const [loading, setLoading] = useState(true);
  const [creditTransactions, setCreditTransactions] = useState([]);
  const { activeTab } = props;

  const refreshList = (showLoading) => {
    setLoading(showLoading);
    if (activeTab === 'transactions') {
      axios.get(ROUTES_CREDITS.LIST).then((response) => {
        setCreditTransactions(response.data);
        setLoading(false);
      });
    }
  };
  useEffect(() => {
    refreshList(true);
  }, []);
  if (loading) {
    return <Loading />;
  }

  return (
    <div>
      {activeTab === 'transactions'
      && (
      <div>
        <CreditTransactionTabs active="credit-transactions" key="tabs" />
        <CreditTransactions title="Credit Transactions" items={creditTransactions} />
      </div>
      )}
    </div>
  );
};


export default CreditsContainer;
