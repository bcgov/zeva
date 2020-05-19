/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

import history from '../app/History';
import ROUTES_ORGANIZATIONS from '../app/routes/Organizations';
import ROUTES_ROLES from '../app/routes/Roles';
import ROUTES_USERS from '../app/routes/Users';
import CustomPropTypes from '../app/utilities/props';
import UserDetailsForm from './components/UserDetailsForm';

const UserAddContainer = (props) => {
  const { id } = useParams();
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [userRoles, setUserRoles] = useState([]);

  const { keycloak, user } = props;

  const handleInputChange = (event) => {
    const { value, name } = event.target;
    if (name === 'roles-manager') {
      if (!event.target.checked) {
        const newRoles = userRoles.filter((each) => each !== event.target.id);
        setUserRoles(newRoles);
      }
      if (event.target.checked) {
        const newRoles = userRoles.concat(event.target.id);
        setUserRoles(newRoles);
      }
    }

    setDetails({
      ...details,
      [name]: value,
    });
  };

  const handleSubmit = () => {
    axios.post(ROUTES_USERS.LIST, {
      ...details,
      roles: userRoles,
    }).then((response) => {
      const { organization } = response.data;

      history.push(ROUTES_ORGANIZATIONS.USERS.replace(/:id/gi, organization.id));
    });
  };

  const refreshDetails = () => {
    setLoading(true);

    const rolesPromise = axios.get(ROUTES_ROLES.LIST).then((response) => {
      setRoles(response.data);
    });

    const detailsPromise = axios.get(ROUTES_ORGANIZATIONS.DETAILS.replace(/:id/gi, id)).then((response) => {
      setDetails({
        ...details,
        organization: response.data,
      });
    });

    Promise.all([detailsPromise, rolesPromise]).then(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);

  return (
    <div>
      <UserDetailsForm
        loading={loading}
        details={details}
        user={user}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        roles={roles}
      />
    </div>
  );
};

UserAddContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default UserAddContainer;
