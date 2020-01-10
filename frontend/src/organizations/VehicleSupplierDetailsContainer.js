/*
 * Container component
 * All data handling & manipulation should be handled here.
 */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';

import VehicleSupplierDetailsPage from './components/VehicleSupplierDetailsPage';

const VehicleSupplierDetailsContainer = (props) => {
  const { id } = useParams();
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const { keycloak } = props;

  const refreshDetails = () => {
    setLoading(true);

    axios.get(`organizations/${id}`).then((response) => {
      setDetails(response.data);

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
    />
  );
};

VehicleSupplierDetailsContainer.propTypes = {
  keycloak: PropTypes.shape().isRequired,
  user: PropTypes.shape({
    organization: PropTypes.shape({}),
  }).isRequired,
};

export default VehicleSupplierDetailsContainer;
