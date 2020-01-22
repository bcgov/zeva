/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import ROUTES_ORGANIZATIONS from '../app/routes/Organizations';
import OrganizationListPage from './components/OrganizationListPage';

const OrganizationListContainer = (props) => {
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const { keycloak } = props;

  const refreshDetails = () => {
    setLoading(true);

    axios.get(ROUTES_ORGANIZATIONS.LIST).then((response) => {
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
