/*
 * Container component
 * All data handling & manipulation should be handled here.
 */

import React, { Component } from 'react';

import OrganizationDetailsPage from './components/OrganizationDetailsPage';

class OrganizationDetailsContainer extends Component {
  componentDidMount() {
  }

  render() {
    return (
      <OrganizationDetailsPage />
    );
  }
}

OrganizationDetailsContainer.propTypes = {
};

export default OrganizationDetailsContainer;
