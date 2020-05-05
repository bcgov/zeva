/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ROUTES_ROLES from '../app/routes/Roles';
import ROUTES_USERS from '../app/routes/Users';
import CustomPropTypes from '../app/utilities/props';
import UserDetailsForm from './components/UserDetailsForm';

const UserEditContainer = (props) => {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const { id } = useParams();
  const [details, setDetails] = useState({});

  const { keycloak, user } = props;

  const rolesList = [
    'Organization Administrator',
    'Signing Authority',
    'Manage ZEV',
    'Request Credits',
    'Compliance Reporting',
    'Credit Transfers',
    'Purchase Agreements',
    'Initiative Agreements',
    'Guest'];

  const handleInputChange = (event) => {
    const { value, name } = event.target;
    if (name === 'roles-manager') {
      if (!event.target.checked) {
        const newRoles = roles.filter((each) => each !== event.target.id);
        setRoles([newRoles]);
      }
      if (event.target.checked) {
        const newRoles = roles.concat(event.target.id);
        setRoles(newRoles);
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
    }).then(() => {
    });
  };

  useEffect(() => {
    setLoading(true);

    axios.get(ROUTES_USERS.DETAILS.replace(/:id/gi, id)).then((response) => {
      axios.get(ROUTES_ROLES.LIST).then((rolesResponse) => {
        setDetails(response.data);
        const roleGroup = rolesResponse.data.map((role) => role.subGroups);
        const subGroupNames = roleGroup[0].map((subGroup) => subGroup.name);
        setRoles(subGroupNames);
        setLoading(false);
      });
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
        rolesList={rolesList}
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
