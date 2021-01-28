import React from 'react';
import CustomPropTypes from '../app/utilities/props';
import ComplianceTabs from '../app/components/ComplianceTabs';
import ComplianceCalculatorDetailsPage from './components/ComplianceCalculatorDetailsPage';

const LDVSalesContainer = (props) => {
  const { user } = props;
  return (
    <>
      <ComplianceTabs active="calculator" />
      <ComplianceCalculatorDetailsPage user={user} />
    </>
  );
};
LDVSalesContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};
export default LDVSalesContainer;
