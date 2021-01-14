import axios from 'axios';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import CustomPropTypes from '../app/utilities/props';
import ComplianceTabs from '../app/components/ComplianceTabs';
import ComplianceRatiosDetailsPage from './components/ComplianceRatiosDetailsPage';

const ComplianceRatiosContainer = (props) => {
  const { user } = props;
  return (
    <>
      <ComplianceTabs active="ratios" user={user} />
      <ComplianceRatiosDetailsPage user={user} />
    </>
  );
};
ComplianceRatiosContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};
export default ComplianceRatiosContainer;
