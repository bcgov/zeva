/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import CustomPropTypes from '../app/utilities/props';

import VehicleForm from './components/VehicleForm';
import ROUTES_VEHICLES from '../app/routes/Vehicles';
import History from '../app/History';

const VehicleAddContainer = (props) => {
  const [fields, setFields] = useState({
    make: { name: '--' },
    modelName: '',
    vehicleFuelType: { vehicleFuelCode: '--' },
    range: '',
    modelYear: { name: '--' },
    vehicleClassCode: { vehicleClassCode: '--' },
  });
  const [loading, setLoading] = useState(true);
  const [makes, setMakes] = useState([]);
  const [types, setTypes] = useState([]);
  const [years, setYears] = useState([]);
  const [classes, setClasses] = useState([]);

  const { keycloak } = props;

  const handleInputChange = (event) => {
    const { value, name } = event.target;

    fields[name] = value;
    setFields({
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
      axios.get(ROUTES_VEHICLES.YEARS),
      axios.get(ROUTES_VEHICLES.FUEL_TYPES),
      axios.get(ROUTES_VEHICLES.CLASSES),
    ]).then(axios.spread((makesRes, yearsRes, typesRes, classesRes) => (
      [setMakes(makesRes.data),
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
      vehicleYears={years}
      vehicleTypes={types}
      vehicleClasses={classes}
      fields={fields}
      formTitle="Enter ZEV"
    />
  );
};

VehicleAddContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
};

export default VehicleAddContainer;
