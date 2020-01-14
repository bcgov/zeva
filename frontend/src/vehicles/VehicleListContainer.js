/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import VehicleList from './components/VehicleList';
import Loading from '../app/components/Loading';

const VehicleListContainer = (props) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const { keycloak } = props;

  const refreshList = () => {
    setLoading(true);

    axios.get('vehicles').then((response) => {
      setVehicles(response.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshList();
  }, [keycloak.authenticated]);


  if (loading) {
    return (<Loading />);
  }

  return (<VehicleList vehicles={vehicles} />);
};

VehicleListContainer.propTypes = {
  keycloak: PropTypes.shape().isRequired,
};

export default VehicleListContainer;
