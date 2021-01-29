import React, { useState } from 'react';
import CustomPropTypes from '../app/utilities/props';
import ComplianceTabs from '../app/components/ComplianceTabs';
import ComplianceCalculatorDetailsPage from './components/ComplianceCalculatorDetailsPage';

const LDVSalesContainer = (props) => {
  const { user } = props;
  const [supplierSize, setSupplierSize] = useState('');
  const [modelYear, setModelYear] = useState({});

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
