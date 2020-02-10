/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import ROUTES_ROLES from '../app/routes/Roles';
import RoleList from './components/RoleList';

const RoleListContainer = (props) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { keycloak, user } = props;

  const refreshList = (showLoading) => {
    setLoading(showLoading);

    axios.get(ROUTES_ROLES.LIST).then((response) => {
      setRoles(response.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshList(true);
  }, [keycloak.authenticated]);

  return (
    <RoleList
      loading={loading}
      roles={roles}
      user={user}
    />
  );
};

RoleListContainer.propTypes = {
  keycloak: PropTypes.shape({
    authenticated: PropTypes.bool,
  }).isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  user: PropTypes.object.isRequired,
};

export default RoleListContainer;
