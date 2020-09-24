/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';

import ROUTES_ORGANIZATIONS from '../app/routes/Organizations';
import CustomPropTypes from '../app/utilities/props';
import OrganizationDetailsPage from './components/OrganizationDetailsPage';

const OrganizationDetailsContainer = (props) => {
  const { keycloak, user } = props;
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);

  const refreshDetails = () => {
    setLoading(true);

    axios.get(ROUTES_ORGANIZATIONS.MINE).then((response) => {
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
      filtered={filtered}
      loading={loading}
      members={members}
      setFiltered={setFiltered}
    />
  );
};

OrganizationDetailsContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default OrganizationDetailsContainer;
