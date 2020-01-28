/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import VehicleForm from './components/VehicleForm';
import ROUTES_VEHICLES from '../app/routes/Vehicles';
import History from '../app/History';

const VehicleAddContainer = (props) => {
  const [fields, setFields] = useState({});
  const [loading, setLoading] = useState(true);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [types, setTypes] = useState([]);
  const [years, setYears] = useState([]);
  const [classes, setClasses] = useState([]);

  const { keycloak } = props;

  const handleInputChange = (event) => {
    const { value, name } = event.target;

    fields[name] = value;
    setFields({
      name: value,
      ...fields,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const data = fields;

    axios.post(ROUTES_VEHICLES.LIST, data).then(() => {
      History.push(ROUTES_VEHICLES.LIST);
    });

    return false;
  };

  const refreshList = () => {
    setLoading(true);
    axios.all([
      axios.get(ROUTES_VEHICLES.MAKES),
      axios.get(ROUTES_VEHICLES.MODELS),
      axios.get(ROUTES_VEHICLES.YEARS),
      axios.get(ROUTES_VEHICLES.FUEL_TYPES),
      axios.get(ROUTES_VEHICLES.CLASSES),
    ]).then(axios.spread((makesRes, modelsRes, yearsRes, typesRes, classesRes) => (
      [setMakes(makesRes.data),
        setModels(modelsRes.data),
        setYears(yearsRes.data),
        setTypes(typesRes.data),
        setClasses(classesRes.data),
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
      vehicleClasses={classes}
      fields={fields}
    />
  );
};

VehicleAddContainer.propTypes = {
  keycloak: PropTypes.shape().isRequired,
};

export default VehicleAddContainer;
