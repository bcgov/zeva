/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';

import ROUTES_ORGANIZATIONS from '../app/routes/Organizations';
import CustomPropTypes from '../app/utilities/props';
import OrganizationListPage from './components/OrganizationListPage';

const OrganizationListContainer = (props) => {
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const { keycloak, user } = props;

  const refreshDetails = () => {
    setLoading(true);
    if (user.isGovernment) {
      axios.get(ROUTES_ORGANIZATIONS.LIST).then((response) => {
        setOrganizations(response.data);
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);

  return (
    <OrganizationListPage
      filtered={filtered}
      loading={loading}
      organizations={organizations}
      setFiltered={setFiltered}
    />
  );
};

OrganizationListContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default OrganizationListContainer;
