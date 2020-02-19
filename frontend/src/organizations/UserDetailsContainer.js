/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import ROUTES_USERS from '../app/routes/Users';
import CustomPropTypes from '../app/utilities/props';
import UserDetailsForm from './components/UserDetailsForm';

const UserDetailsContainer = (props) => {
  const [userToView, setUserView] = useState({});
  const [loading, setLoading] = useState(true);

  const { id } = useParams();

  const { keycloak, user } = props;

  const handleInputChange = (event) => {
    const { value, name } = event.target;
    setUserView({
      ...userToView,
      [name]: value,
    });
  };


  const handleSubmit = () => {
    console.log('Submit!');
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
        keycloak={keycloak}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
      />
      )}
    </div>
  );
};

UserDetailsContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
};

export default UserDetailsContainer;
