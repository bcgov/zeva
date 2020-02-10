/*
 * Container component
 * All data handling & manipulation should be handled here.
 */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';

import ROUTES_ORGANIZATIONS from '../app/routes/Organizations';
import ROUTES_VEHICLES from '../app/routes/Vehicles';
import CustomPropTypes from '../app/utilities/props';
import VehicleSupplierDetailsPage from './components/VehicleSupplierDetailsPage';

const VehicleSupplierDetailsContainer = (props) => {
  const { id } = useParams();
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const { keycloak } = props;

  const refreshDetails = () => {
    setLoading(true);

    const detailsPromise = axios.get(ROUTES_ORGANIZATIONS.DETAILS.replace(/:id/gi, id)).then((response) => {
      setDetails(response.data);
    });

    const vehiclesPromise = axios.get(ROUTES_VEHICLES.LIST).then((response) => {
      setVehicles(response.data);
    });

    Promise.all([detailsPromise, vehiclesPromise]).then(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);

  return (
    <VehicleSupplierDetailsPage
      details={details}
      loading={loading}
      vehicles={vehicles}
    />
  );
};

VehicleSupplierDetailsContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
};

export default VehicleSupplierDetailsContainer;
