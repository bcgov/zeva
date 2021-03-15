import axios from 'axios';
import React, { useEffect, useState } from 'react';

import ROUTES_CREDITS from '../app/routes/Credits';
import CustomPropTypes from '../app/utilities/props';
import ComplianceReportTabs from './components/ComplianceReportTabs';
import ComplianceObligationDetailsPage from './components/ComplianceObligationDetailsPage';
import ROUTES_SIGNING_AUTHORITY_ASSERTIONS from '../app/routes/SigningAuthorityAssertions';

const ComplianceObligationContainer = (props) => {
  const { keycloak, user } = props;
  const reportStatuses = {
    assessment: '',
    consumerSales: '',
    creditActivity: 'draft',
    reportSummary: '',
    supplierInformation: '',
  };
  const [loading, setLoading] = useState(true);
  const [assertions, setAssertions] = useState([]);
  const [checkboxes, setCheckboxes] = useState([]);
  const [reportYear, setReportYear] = useState('2020')

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
    const listAssertion = axios.get(ROUTES_SIGNING_AUTHORITY_ASSERTIONS.LIST).then((response) => {
      const filteredAssertions = response.data.filter((data) => data.module === 'compliance_obligation');
      setAssertions(filteredAssertions);
    });


    Promise.all([listAssertion]).then(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);

  return (
    <>
      <ComplianceReportTabs active="credit-activity" reportStatuses={reportStatuses} user={user} />
      <ComplianceObligationDetailsPage
        reportYear={reportYear}
        loading={loading}
        user={user}
        assertions={assertions}
        checkboxes={checkboxes}
        handleCheckboxClick={handleCheckboxClick}
      />
    </>
  );
};

ComplianceObligationContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default ComplianceObligationContainer;
