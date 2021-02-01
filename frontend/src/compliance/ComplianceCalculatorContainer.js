import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loading from '../app/components/Loading';
import CustomPropTypes from '../app/utilities/props';
import ComplianceTabs from '../app/components/ComplianceTabs';
import ComplianceCalculatorDetailsPage from './components/ComplianceCalculatorDetailsPage';

const LDVSalesContainer = (props) => {
  const { user } = props;
  const [supplierSize, setSupplierSize] = useState('');
  const [modelYear, setModelYear] = useState({});
  const [complianceRatios, setComplianceRatios] = useState({});
  const [loading, setLoading] = useState(true);

  const refreshDetails = () => {
    axios.all([
      // axios.get(ROUTE FOR MODEL YEARS?),
      // axios.get(ROUTE FOR COMPLIANCE RATIOS),
    ]).then(axios.spread((modelYearResponse, complianceRatiosResponse) => {
      setModelYear(modelYearResponse);
      setComplianceRatios(complianceRatiosResponse);
      setLoading(false);
    }));
  };

  useEffect(() => {
    refreshDetails();
  }, []);

  return (
    <>
      <ComplianceTabs active="calculator" user={user} />
      <ComplianceCalculatorDetailsPage
        user={user}
        supplierSize={supplierSize}
        setSupplierSize={setSupplierSize}
        modelYear={modelYear}
        setModelYear={setModelYear}
      />
    </>
  );
};
LDVSalesContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};
export default LDVSalesContainer;
