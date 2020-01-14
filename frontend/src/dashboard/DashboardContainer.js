/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import PropTypes from 'prop-types';
import React from 'react';

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
  user: PropTypes.shape({
    organization: PropTypes.shape({}),
  }).isRequired,
};

export default DashboardContainer;
