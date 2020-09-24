/*
 * Container component
 * All data handling & manipulation should be handled here.
 */

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import ROUTES_ORGANIZATIONS from '../app/routes/Organizations';
import ROUTES_VEHICLES from '../app/routes/Vehicles';
import CustomPropTypes from '../app/utilities/props';
import VehicleSupplierTabs from '../app/components/VehicleSupplierTabs';
import VehicleSupplierZEVListPage from './components/VehicleSupplierZEVListPage';

const VehicleSupplierModelListContainer = (props) => {
  const { id } = useParams();
  const [details, setDetails] = useState({});
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const { keycloak, user } = props;

  const handleClear = () => {
    setFiltered([]);
  };

  const refreshDetails = () => {
    setLoading(true);
    const detailsPromise = axios.get(ROUTES_ORGANIZATIONS.DETAILS.replace(/:id/gi, id)).then((response) => {
      setDetails(response.data);
    });

    const vehiclesPromise = axios.get(ROUTES_VEHICLES.LIST, {
      params: {
        organization_id: id,
      },
    }).then((response) => {
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
    <div className="page">
      <h1>{details.name}</h1>
      <VehicleSupplierTabs supplierId={details.id} active="supplier-zev-models" />
      <VehicleSupplierZEVListPage
        filtered={filtered}
        handleClear={handleClear}
        loading={loading}
        setFiltered={setFiltered}
        user={user}
        vehicles={vehicles}
      />
    </div>
  );
};
VehicleSupplierModelListContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default VehicleSupplierModelListContainer;
