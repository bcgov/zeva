/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import React from 'react';
import CustomPropTypes from '../app/utilities/props';

import DashboardPage from './components/DashboardPage';

const DashboardContainer = (props) => {
  const { user } = props;

  return (
    <DashboardPage user={user} />
  );
};

DashboardContainer.defaultProps = {
};

DashboardContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};

export default DashboardContainer;
