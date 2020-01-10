/*
 * Container component
 * All data handling & manipulation should be handled here.
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import OrganizationListPage from './components/OrganizationListPage';

const OrganizationListContainer = (props) => {
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const { keycloak } = props;

  const refreshDetails = () => {
    setLoading(true);

    axios.get('organizations').then((response) => {
      setOrganizations(response.data);

      setLoading(false);
    });
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);

  return (
    <OrganizationListPage
      loading={loading}
      organizations={organizations}
    />
  );
};

OrganizationListContainer.propTypes = {
  keycloak: PropTypes.shape().isRequired,
};

export default OrganizationListContainer;
