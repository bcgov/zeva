/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import ROUTES_VEHICLES from '../app/routes/Vehicles';
import VehicleList from './components/VehicleList';

const VehicleListContainer = (props) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [validatedList, setValidatedList] = useState([]);
  const { keycloak, user } = props;

  const handleCheckboxClick = (event) => {
    const vehicleId = event.target.value;
    if (validatedList.includes(vehicleId)) {
      setValidatedList(validatedList.filter((item) => item !== vehicleId));
    } else {
      setValidatedList(() => [...validatedList, vehicleId]);
    }
  };

  const refreshList = (showLoading) => {
    setLoading(showLoading);

    axios.get(ROUTES_VEHICLES.LIST).then((response) => {
      setVehicles(response.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshList(true);
  }, [keycloak.authenticated]);

  const handleSubmit = () => {
    validatedList.forEach((vehicleId) => {
      axios.patch(`/vehicles/${vehicleId}/state_change`, {
        state: 'VALIDATED',
      }).then(() => {
        setValidatedList([]);
        refreshList(false);
      });
    });
  };

  return (
    <VehicleList
      loading={loading}
      vehicles={vehicles}
      user={user}
      handleCheckboxClick={handleCheckboxClick}
      handleSubmit={handleSubmit}
    />
  );
};

VehicleListContainer.propTypes = {
  keycloak: PropTypes.shape({
    authenticated: PropTypes.bool,
  }).isRequired,
};

export default VehicleListContainer;
