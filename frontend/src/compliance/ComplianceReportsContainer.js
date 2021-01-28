import axios from 'axios';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import CustomPropTypes from '../app/utilities/props';
import ComplianceTabs from '../app/components/ComplianceTabs';
import ComplianceReportsDetailsPage from './components/ComplianceReportsDetailsPage';
import ComplianceReportTabs from './components/ComplianceReportTabs';

const ComplianceReportsContainer = (props) => {
  const { user } = props;
  return (
    <>
      <ComplianceTabs active="reports" user={user} />
      <ComplianceReportTabs />
      <ComplianceReportsDetailsPage user={user} />
    </>
  );
};
ComplianceReportsContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};
export default ComplianceReportsContainer;
