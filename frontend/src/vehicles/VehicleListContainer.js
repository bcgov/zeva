/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import ROUTES_VEHICLES from '../app/routes/Vehicles';
import CustomPropTypes from '../app/utilities/props';
import VehicleList from './components/VehicleList';

const qs = require('qs');

const VehicleListContainer = (props) => {
  const [filtered, setFiltered] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { keycloak, user, location } = props;
  const query = qs.parse(location.search, { ignoreQueryPrefix: true });
  const handleClear = () => {
    setFiltered([]);
  };
  const refreshList = (showLoading) => {
    setLoading(showLoading);
    const queryFilter = [];
    Object.entries(query).forEach(([key, value]) => {
      queryFilter.push({ id: key, value });
    });
    setFiltered([...filtered, ...queryFilter]);
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

export default withRouter(VehicleListContainer);
