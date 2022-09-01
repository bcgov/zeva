import axios from 'axios';
import React, { useEffect, useState } from 'react';
import CustomPropTypes from '../app/utilities/props';
import ComplianceTabs from '../app/components/ComplianceTabs';
import ROUTES_COMPLIANCE from '../app/routes/Compliance';
import ComplianceRatiosDetailsPage from './components/ComplianceRatiosDetailsPage';

const ComplianceRatiosContainer = (props) => {
  const [loading, setLoading] = useState(true);
  const { user } = props;
  const [complianceRatios, setComplianceRatios] = useState([]);

  const refreshList = (showLoading) => {
    setLoading(showLoading);
    axios.get(ROUTES_COMPLIANCE.RATIOS).then((response) => {
      setComplianceRatios(response.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshList(true);
  }, []);

  return (
    <>
      <ComplianceTabs active="ratios" user={user} />
      <ComplianceRatiosDetailsPage
        user={user}
        loading={loading}
        complianceRatios={complianceRatios}
      />
    </>
  );
};
ComplianceRatiosContainer.propTypes = {
  user: CustomPropTypes.user.isRequired
};
export default ComplianceRatiosContainer;
