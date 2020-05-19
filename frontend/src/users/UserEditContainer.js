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

const UserEditContainer = (props) => {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const { id } = useParams();
  const [details, setDetails] = useState({});
  const [userRoles, setUserRoles] = useState([]);

  const { keycloak, user } = props;

  const handleInputChange = (event) => {
    const { value, name } = event.target;
    if (name === 'roles-manager') {
      if (!event.target.checked) {
        const newRoles = userRoles.filter((each) => Number(each) !== Number(event.target.id));
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
    axios.put(ROUTES_USERS.DETAILS.replace(/:id/gi, id), {
      ...details,
      roles: userRoles,
    }).then((response) => {
      const { organization } = response.data;

      history.push(ROUTES_ORGANIZATIONS.USERS.replace(/:id/gi, organization.id));
    });
  };

  useEffect(() => {
    setLoading(true);

    const rolesPromise = axios.get(ROUTES_ROLES.LIST).then((response) => {
      setRoles(response.data);
    });

    const detailsPromise = axios.get(ROUTES_USERS.DETAILS.replace(/:id/gi, id)).then((response) => {
      setDetails(response.data);

      const { roles: uRoles } = response.data;
      const roleIds = uRoles.map((role) => role.id);
      setUserRoles(roleIds);
    });

    Promise.all([detailsPromise, rolesPromise]).then(() => {
      setLoading(false);
    });
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

UserEditContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default UserEditContainer;
