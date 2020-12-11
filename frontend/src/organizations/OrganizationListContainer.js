/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';

import ROUTES_ORGANIZATIONS from '../app/routes/Organizations';
import CustomPropTypes from '../app/utilities/props';
import OrganizationListPage from './components/OrganizationListPage';

const OrganizationListContainer = (props) => {
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const { keycloak, location, user } = props;

  const refreshDetails = () => {
    setLoading(true);
    if (user.isGovernment) {
      if (location.state) {
        setFiltered([...filtered, ...location.state]);
      }

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
      user={user}
    />
  );
};

OrganizationListContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  location: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default withRouter(OrganizationListContainer);
