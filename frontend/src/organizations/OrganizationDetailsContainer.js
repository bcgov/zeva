/*
 * Container component
 * All data handling & manipulation should be handled here.
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import OrganizationDetailsPage from './components/OrganizationDetailsPage';

const OrganizationDetailsContainer = (props) => {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const { keycloak, user } = props;

  const refreshDetails = () => {
    setLoading(true);

    axios.get('organizations/mine').then((response) => {
      const { users } = response.data;

      setMembers(users);

      setLoading(false);
    });
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);

  return (
    <OrganizationDetailsPage
      details={user.organization}
      loading={loading}
      members={members}
    />
  );
};

OrganizationDetailsContainer.propTypes = {
  keycloak: PropTypes.shape().isRequired,
  user: PropTypes.shape({
    organization: PropTypes.shape({}),
  }).isRequired,
};

export default OrganizationDetailsContainer;
