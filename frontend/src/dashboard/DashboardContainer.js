/*
 * Container component
 * All data handling & manipulation should be handled here.
 */

import React, { Component } from 'react';

import DashboardPage from './components/DashboardPage';

class DashboardContainer extends Component {
  componentDidMount() {
  }

  render() {
    return (
      <DashboardPage />
    );
  }
}

DashboardContainer.defaultProps = {
};

DashboardContainer.propTypes = {
};

export default DashboardContainer;
