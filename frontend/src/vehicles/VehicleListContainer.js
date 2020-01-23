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
  const { keycloak, user } = props;
  const refreshList = () => {
    setLoading(true);

    axios.get(ROUTES_VEHICLES.LIST).then((response) => {
      setVehicles(response.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshList();
  }, [keycloak.authenticated]);

  return (<VehicleList loading={loading} vehicles={vehicles} user={user} />);
};

VehicleListContainer.propTypes = {
  keycloak: PropTypes.shape({
    authenticated: PropTypes.bool,
  }).isRequired,
};

export default VehicleListContainer;
