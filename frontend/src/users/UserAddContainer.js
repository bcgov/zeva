/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ROUTES_ORGANIZATIONS from '../app/routes/Organizations';
import ROUTES_USERS from '../app/routes/Users';
import CustomPropTypes from '../app/utilities/props';
import UserDetailsForm from './components/UserDetailsForm';

const UserAddContainer = (props) => {
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
    axios.post(ROUTES_USERS.LIST, {
      ...details,
      roles,
    }).then(() => {
    });
  };

  const refreshDetails = () => {
    setLoading(true);

    axios.get(ROUTES_ORGANIZATIONS.DETAILS.replace(/:id/gi, id)).then((response) => {
      setDetails({
        ...details,
        organization: response.data,
      });

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
        rolesList={rolesList}
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
