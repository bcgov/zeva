import axios from 'axios';
import React, { useEffect, useState } from 'react';

import ROUTES_CREDITS from '../app/routes/Credits';
import CustomPropTypes from '../app/utilities/props';
import ComplianceReportTabs from './components/ComplianceReportTabs';
import CreditActivityDetailsPage from './components/CreditActivityDetailsPage';

const CreditActivityContainer = (props) => {
  const { keycloak, user } = props;
  const reportStatuses = {
    assessment: '',
    consumerSales: '',
    creditActivity: 'draft',
    reportSummary: '',
    supplierInformation: '',
  };
  const [balances, setBalances] = useState([]);
  const [creditTransactions, setCreditTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshDetails = () => {
    setLoading(true);
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
    refreshDetails();
  }, [keycloak.authenticated]);

  return (
    <>
      <ComplianceReportTabs active="credit-activity" reportStatuses={reportStatuses} user={user} />
      <CreditActivityDetailsPage
        balances={balances}
        loading={loading}
        transactions={creditTransactions}
        user={user}
      />
    </>
  );
};

CreditActivityContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default CreditActivityContainer;
