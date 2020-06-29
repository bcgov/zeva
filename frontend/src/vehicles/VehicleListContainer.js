/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';

import ROUTES_VEHICLES from '../app/routes/Vehicles';
import CustomPropTypes from '../app/utilities/props';
import VehicleList from './components/VehicleList';

const VehicleListContainer = (props) => {
  const [filtered, setFiltered] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { keycloak, user } = props;
  const handleClear = () => {
    setFiltered([]);
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

  return (
    <VehicleList
      filtered={filtered}
      setFiltered={setFiltered}
      handleClear={handleClear}
      loading={loading}
      vehicles={vehicles}
      user={user}
    />
  );
};

VehicleListContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default VehicleListContainer;
