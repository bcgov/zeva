/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import React, {useEffect, useState} from 'react';
import axios from "axios";

import VehicleDetailsPage from "./components/VehicleDetailsPage";
import {useParams} from "react-router-dom";

const VehicleDetailContainer = (props) => {
  const [vehicle, setVehicle] = useState({});
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  const {keycloak} = props;

  const refreshList = () => {
    setLoading(true);

    axios.get(`vehicles/${id}`).then((response) => {
      setVehicle(response.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshList();
  }, [keycloak.authenticated]);

  return (<VehicleDetailsPage loading={loading} details={vehicle} />);
};

VehicleDetailContainer.propTypes = {};

export default VehicleDetailContainer;
