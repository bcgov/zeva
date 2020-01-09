/*
 * Container component
 * All data handling & manipulation should be handled here.
 */

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import OrganizationDetailsPage from './components/OrganizationDetailsPage';
import CONFIG from "../app/config";

const OrganizationDetailsContainer = (props) => {
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const { keycloak } = props;

  const refreshDetails = () => {
    const { token } = keycloak;

    setLoading(true);

    const organizationPromise = axios.get(`${CONFIG.APIBASE}/api/organizations/mine`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((response) => {
      const { users } = response.data;

      setMembers(users);
    });

    const usersPromise = axios.get(`${CONFIG.APIBASE}/api/users/current`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((response) => {
      const { organization, displayName } = response.data;

      setDetails({
        displayName,
        organization,
      });
    });

    Promise.all([
      organizationPromise,
      usersPromise,
    ]).then(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);

  return (
    <OrganizationDetailsPage
      details={details}
      loading={loading}
      members={members}
    />
  );
};

OrganizationDetailsContainer.propTypes = {
  keycloak: PropTypes.shape().isRequired,
};

export default OrganizationDetailsContainer;
