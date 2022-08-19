/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';

import ROUTES_USERS from '../app/routes/Users';
import CustomPropTypes from '../app/utilities/props';
import ActiveUsersListPage from './components/ActiveUsersListPage';

const ActiveUsersListContainer = (props) => {
  const [loading, setLoading] = useState(false);
  const [activeIdirUsers, setActiveIdirUsers] = useState('');
  const [activeBceidUsers, setActiveBceidUsers] = useState('');
  const { keycloak, user } = props;

  const refreshDetails = () => {
    if (user.isGovernment) {
      setLoading(true);
      let filteredIdir = '';
      let filteredBceid = '';
      axios.get(ROUTES_USERS.LIST).then((response) => {
        response.data.forEach((userProfile) => {
          if (userProfile.isActive === true && userProfile.email) {
            if (userProfile.isGovernment) {
              filteredIdir += userProfile.email;
              filteredIdir += '; ';
            } else {
              filteredBceid += userProfile.email;
              filteredBceid += '; ';
            }
          }
        });
        filteredIdir = filteredIdir.substring(0, filteredIdir.length - 2);
        filteredBceid = filteredBceid.substring(0, filteredBceid.length - 2);
        setActiveIdirUsers(filteredIdir);
        setActiveBceidUsers(filteredBceid);
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);

  return (
    <>
      {user.isGovernment && (
        <ActiveUsersListPage
          activeIdirUsers={activeIdirUsers}
          activeBceidUsers={activeBceidUsers}
          loading={loading}
        />
      )}
    </>
  );
};

ActiveUsersListContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  user: CustomPropTypes.user.isRequired
};

export default withRouter(ActiveUsersListContainer);
