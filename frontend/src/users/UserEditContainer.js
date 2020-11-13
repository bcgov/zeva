/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useParams } from 'react-router-dom';

import history from '../app/History';
import ROUTES_ORGANIZATIONS from '../app/routes/Organizations';
import ROUTES_ROLES from '../app/routes/Roles';
import ROUTES_USERS from '../app/routes/Users';
import parseErrorResponse from '../app/utilities/parseErrorResponse';
import CustomPropTypes from '../app/utilities/props';
import UserDetailsForm from './components/UserDetailsForm';

const UserEditContainer = (props) => {
  let { id } = useParams();
  const [details, setDetails] = useState({
    isActive: true,
  });
  const [errorFields, setErrorFields] = useState({});
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [userRoles, setUserRoles] = useState([]);

  const { keycloak, user, newUser } = props;

  if (!id) {
    ({ id } = user.organization);
  }

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

  const saveUser = () => {
    if (!newUser && id) {
      return axios.put(ROUTES_USERS.DETAILS.replace(/:id/gi, id), {
        ...details,
        roles: userRoles,
      });
    }

    return axios.post(ROUTES_USERS.LIST, {
      ...details,
      email: details.keycloakEmail,
      roles: userRoles,
    });
  };

  const handleSubmit = () => {
    saveUser().then((response) => {
      const { organization } = response.data;

      if (organization.id === user.organization.id) {
        history.push(ROUTES_ORGANIZATIONS.MINE);
      } else {
        history.push(ROUTES_ORGANIZATIONS.USERS.replace(/:id/gi, organization.id));
      }
    }).catch((errors) => {
      if (!errors.response) {
        return;
      }

      const { data } = errors.response;
      const err = {};

      parseErrorResponse(err, data);
      setErrorFields(err);
    });
  };

  useEffect(() => {
    setLoading(true);

    const rolesPromise = axios.get(ROUTES_ROLES.LIST).then((response) => {
      setRoles(response.data);
    });

    let detailsPromise;

    if (newUser) {
      detailsPromise = axios.get(ROUTES_ORGANIZATIONS.DETAILS.replace(/:id/gi, id)).then((response) => {
        setDetails({
          ...details,
          organization: response.data,
        });
      });
    } else {
      detailsPromise = axios.get(ROUTES_USERS.DETAILS.replace(/:id/gi, id)).then((response) => {
        setDetails(response.data);

        const { roles: uRoles } = response.data;
        const roleIds = uRoles.map((role) => role.id);
        setUserRoles(roleIds);
      });
    }

    Promise.all([detailsPromise, rolesPromise]).then(() => {
      setLoading(false);
    });
  }, [keycloak.authenticated]);

  return (
    <div>
      <UserDetailsForm
        details={details}
        errorFields={errorFields}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        loading={loading}
        roles={roles}
        user={user}
      />
    </div>
  );
};

UserEditContainer.defaultProps = {
  newUser: false,
};

UserEditContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  newUser: PropTypes.bool,
  user: CustomPropTypes.user.isRequired,
};

export default UserEditContainer;
