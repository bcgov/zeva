/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import VehicleForm from './components/VehicleForm';

import ROUTES_VEHICLES from '../app/routes/Vehicles';

const VehicleAddContainer = (props) => {
  const [loading, setLoading] = useState(true);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [types, setTypes] = useState([]);
  const [years, setYears] = useState([]);
  const { keycloak } = props;

  const refreshList = () => {
    setLoading(true);
    axios.all([
      axios.get(ROUTES_VEHICLES.MAKES),
      axios.get(ROUTES_VEHICLES.MODELS),
      axios.get(ROUTES_VEHICLES.YEARS),
      axios.get(ROUTES_VEHICLES.FUEL_TYPES),
    ]).then(axios.spread((makesRes, modelsRes, yearsRes, typesRes) => (
      [setMakes(makesRes.data),
        setModels(modelsRes.data),
        setYears(yearsRes.data),
        setTypes(typesRes.data),
        setLoading(false)]
    )));
  };

  useEffect(() => {
    refreshList();
  }, [keycloak.authenticated]);

  return (
    <VehicleForm
      loading={loading}
      vehicleMakes={makes}
      vehicleModels={models}
      vehicleYears={years}
      vehicleTypes={types}
    />
  );
};

VehicleAddContainer.propTypes = {
  keycloak: PropTypes.shape().isRequired,
};

export default VehicleAddContainer;
