/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import CustomPropTypes from '../app/utilities/props';

import VehicleForm from './components/VehicleForm';
import ROUTES_VEHICLES from '../app/routes/Vehicles';
import ROUTES_ORGANIZATIONS from '../app/routes/Organizations';
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
  const { keycloak, user } = props;

  const supplierId = user.organization.id
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
        console.log(orgVehiclesRes),
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
      vehicleYears={years}
      vehicleTypes={types}
      fields={fields}
      vehicleClasses={classes}
      formTitle="Enter ZEV"
    />
  );
};

VehicleAddContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
};

export default VehicleAddContainer;
