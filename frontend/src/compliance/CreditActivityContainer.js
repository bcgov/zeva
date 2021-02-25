import axios from 'axios';
import React, { useEffect, useState } from 'react';

import ROUTES_CREDITS from '../app/routes/Credits';
import CustomPropTypes from '../app/utilities/props';
import ComplianceReportTabs from './components/ComplianceReportTabs';
import CreditActivityDetailsPage from './components/CreditActivityDetailsPage';
import ROUTES_SIGNING_AUTHORITY_ASSERTIONS from '../app/routes/SigningAuthorityAssertions';

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
  const [assertions, setAssertions] = useState([]);
  const [checkboxes, setCheckboxes] = useState([]);

  const handleCheckboxClick = (event) => {
    if (!event.target.checked) {
      const checked = checkboxes.filter((each) => Number(each) !== Number(event.target.id));
      setCheckboxes(checked);
    }

    if (event.target.checked) {
      const checked = checkboxes.concat(event.target.id);
      setCheckboxes(checked);
    }
  };

  const refreshDetails = () => {
    setLoading(true);
    const balancePromise = axios.get(ROUTES_CREDITS.CREDIT_BALANCES).then((response) => {
      setBalances(response.data);
    });

    const listPromise = axios.get(ROUTES_CREDITS.LIST).then((response) => {
      setCreditTransactions(response.data);
    });

    const listAssertion = axios.get(ROUTES_SIGNING_AUTHORITY_ASSERTIONS.LIST).then((response) => {
      let filteredAsserstions = response.data.filter((data) => data.module == 'compliance_obligation');
      setAssertions(filteredAsserstions);
    });

    Promise.all([balancePromise, listPromise, listAssertion]).then(() => {
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
        assertions={assertions}
        checkboxes={checkboxes}
        handleCheckboxClick={handleCheckboxClick}
      />
    </>
  );
};

CreditActivityContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default CreditActivityContainer;
