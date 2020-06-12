/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

import history from '../app/History';
import ROUTES_VEHICLES from '../app/routes/Vehicles';
import CustomPropTypes from '../app/utilities/props';
import VehicleDetailsPage from './components/VehicleDetailsPage';
import VehicleValidatePage from './components/VehicleValidatePage';

const VehicleDetailsContainer = (props) => {
  const [vehicle, setVehicle] = useState({});
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({});
  const { id } = useParams();

  const { keycloak, user } = props;

  const stateChange = (newState) => {
    setLoading(true);
    axios.patch(`vehicles/${id}/state_change`, { validationStatus: newState }).then(() => {
      history.push(ROUTES_VEHICLES.LIST);
    });
  };

  const postComment = (newState) => {
    setLoading(true);
    axios.patch(ROUTES_VEHICLES.DETAILS.replace(/:id/gi, id), comments).then(() => {
      stateChange(newState);
    });
  };

  const refreshList = () => {
    setLoading(true);

    axios.get(ROUTES_VEHICLES.DETAILS.replace(/:id/gi, id)).then((response) => {
      console.log(response.data);
      setVehicle(response.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshList();
  }, [keycloak.authenticated]);

  if (user.isGovernment) {
    return (
      <VehicleValidatePage
        loading={loading}
        comments={comments}
        details={vehicle}
        setComments={setComments}
        requestStateChange={stateChange}
        postComment={postComment}
      />
    );
  }

  return (
    <VehicleDetailsPage
      loading={loading}
      details={vehicle}
      requestStateChange={stateChange}
    />
  );
};

VehicleDetailsContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default VehicleDetailsContainer;
