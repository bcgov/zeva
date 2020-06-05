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
    make: '',
    modelName: '',
    vehicleZevType: { vehicleZevCode: '--' },
    range: '',
    modelYear: { name: '--' },
    vehicleClassCode: { vehicleClassCode: '--' },
    weightKg: '',
  });
  const [loading, setLoading] = useState(true);
  const [types, setTypes] = useState([]);
  const [years, setYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const { keycloak } = props;


  const handleInputChange = (event) => {
    const { value, name } = event.target;
    let input = value.trim();
    if (name === 'make') {
      input = input.toUpperCase();
    }
    fields[name] = input;
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

  const orgMakes = vehicles.map((vehicle) => vehicle.make);
  const refreshList = () => {
    setLoading(true);
    axios.all([
      axios.get(ROUTES_VEHICLES.YEARS),
      axios.get(ROUTES_VEHICLES.ZEV_TYPES),
      axios.get(ROUTES_VEHICLES.CLASSES),
      axios.get(ROUTES_VEHICLES.LIST),
    ]).then(axios.spread((yearsRes, typesRes, classesRes, orgVehiclesRes) => (
      [setYears(yearsRes.data),
        setTypes(typesRes.data),
        setClasses(classesRes.data),
        setVehicles(orgVehiclesRes.data),
        setLoading(false)]
    )));
  };

  useEffect(() => {
    refreshList();
  }, [keycloak.authenticated]);

  return (
    <VehicleForm
      makes={orgMakes}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      loading={loading}
      vehicleYears={years}
      vehicleTypes={types}
      fields={fields}
      vehicleClasses={classes}
      formTitle="Enter ZEV"
      setFields={setFields}
    />
  );
};

VehicleAddContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
};

export default VehicleAddContainer;
