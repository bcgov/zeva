import axios from 'axios';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import CustomPropTypes from '../app/utilities/props';
import ComplianceTabs from '../app/components/ComplianceTabs';
import ComplianceReportsDetailsPage from './components/ComplianceReportsDetailsPage';

const ComplianceReportsContainer = (props) => {
  const { user } = props;
  return (
    <>
      <ComplianceTabs active="reports" user={user} />
      <ComplianceReportsDetailsPage user={user} />
    </>
  );
};
ComplianceReportsContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};
export default ComplianceReportsContainer;
