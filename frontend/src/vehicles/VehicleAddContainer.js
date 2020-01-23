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
  const [fields, setFields] = useState({});
  const [loading, setLoading] = useState(true);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [trims, setTrims] = useState([]);
  const [types, setTypes] = useState([]);
  const [years, setYears] = useState([]);
  const { keycloak } = props;

  const handleInputChange = (event) => {
    const { value, name } = event.target;

    fields[name] = value;
    setFields(fields);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const data = fields;

    axios.post(ROUTES_VEHICLES.LIST, data).then((response) => {
      console.error(response);
    });

    return false;
  };

  const refreshList = () => {
    setLoading(true);
    axios.all([
      axios.get('vehicles/makes'),
      axios.get('vehicles/models'),
      axios.get('vehicles/years'),
      axios.get('vehicles/types'),
      axios.get('vehicles/trims'),
    ])
      .then(axios.spread((makesRes, modelsRes, yearsRes, typesRes, trimsRes) => (
        [setMakes(makesRes.data),
          setModels(modelsRes.data),
          setYears(yearsRes.data),
          setTypes(typesRes.data),
          setTrims(trimsRes.data),
          setLoading(false)]
      )));
  };

  useEffect(() => {
    refreshList();
  }, [keycloak.authenticated]);
  return (
    <VehicleForm
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      loading={loading}
      vehicleMakes={makes}
      vehicleModels={models}
      vehicleYears={years}
      vehicleTypes={types}
      vehicleTrims={trims}
    />
  );
};

VehicleAddContainer.propTypes = {
  keycloak: PropTypes.shape().isRequired,
};

export default VehicleAddContainer;
