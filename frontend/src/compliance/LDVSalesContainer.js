import axios from 'axios';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import CustomPropTypes from '../app/utilities/props';
import ComplianceTabs from '../app/components/ComplianceTabs';
import LDVSalesDetailsPage from './components/LDVSalesDetailsPage';

const LDVSalesContainer = (props) => {
  const { user } = props;
  return (
    <>
      <ComplianceTabs active="sales" />
      <LDVSalesDetailsPage user={user} />
    </>
  );
};
LDVSalesContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};
export default LDVSalesContainer;
