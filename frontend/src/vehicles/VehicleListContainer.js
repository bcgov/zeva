/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import React, {useEffect, useState} from 'react';
import axios from "axios";

import VehicleList from './components/VehicleList';

const VehicleListContainer = (props) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const {keycloak} = props;

  const refreshList = () => {
    setLoading(true);

    axios.get(`vehicles`).then((response) => {
      setVehicles(response.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshList();
  }, [keycloak.authenticated]);

  return (<VehicleList loading={loading} vehicles={vehicles}/>);
};

VehicleListContainer.propTypes = {};

export default VehicleListContainer;
