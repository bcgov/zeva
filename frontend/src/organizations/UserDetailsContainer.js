/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ROUTES_USERS from '../app/routes/Users';
import ROUTES_ROLES from '../app/routes/Roles';
import CustomPropTypes from '../app/utilities/props';
import UserDetailsForm from '../users/components/UserDetailsForm';

const UserDetailsContainer = (props) => {
  const [userToView, setUserView] = useState({});
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const { id } = useParams();

  const { user } = props;

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
    setUserView({
      ...userToView,
      [name]: value,
    });
  };

  const handleSubmit = () => {
    console.log(userToView);
    console.log(roles);
  };

  useEffect(() => {
    setLoading(true);
    axios.get(ROUTES_USERS.DETAILS.replace(/:id/gi, id)).then((response) => {
      setUserView(response.data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      { !loading && userToView && (
      <UserDetailsForm
        loading={loading}
        details={userToView}
        user={user}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        rolesList={rolesList}
        roles={roles}
      />
      )}
    </div>
  );
};

UserDetailsContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
};

export default UserDetailsContainer;
