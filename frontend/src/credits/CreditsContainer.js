import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import CreditTransactions from './components/CreditTransactions';
import Loading from '../app/components/Loading';
import CreditTransactionTabs from '../app/components/CreditTransactionTabs';
import ROUTES_CREDITS from '../app/routes/Credits';
import CustomPropTypes from '../app/utilities/props';


const CreditsContainer = (props) => {
  const [loading, setLoading] = useState(true);
  const [creditTransactions, setCreditTransactions] = useState([]);
  const { activeTab, user } = props;

  const refreshList = (showLoading) => {
    setLoading(showLoading);
<<<<<<< HEAD

    axios.get(ROUTES_CREDITS.LIST).then((response) => {
      setCreditTransactions(response.data);
      setLoading(false);
    });
=======
    if (activeTab === 'transactions') {
      axios.get(ROUTES_CREDITS.LIST).then((response) => {
        setCreditTransactions(response.data);
        setLoading(false);
      });
    }
>>>>>>> upstream/release-sprint-8
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
        <CreditTransactionTabs active="credit-transactions" key="tabs" user={user} />
        <CreditTransactions title="Credit Transactions" items={creditTransactions} />
      </div>
      )}
    </div>
  );
};

CreditsContainer.propTypes = {
  activeTab: PropTypes.string.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default CreditsContainer;
