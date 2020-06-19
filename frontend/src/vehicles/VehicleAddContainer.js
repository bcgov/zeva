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
  const emptyForm = {
    make: '',
    modelName: '',
    vehicleZevType: { vehicleZevCode: '--' },
    range: '',
    modelYear: { name: '--' },
    vehicleClassCode: { vehicleClassCode: '--' },
    weightKg: '',
  };
  const [fields, setFields] = useState(emptyForm);
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

  const handleSaveDraft = (event) => {
    event.preventDefault();
    const data = fields;
    axios.post(ROUTES_VEHICLES.LIST, data).then(() => {
      History.push(ROUTES_VEHICLES.LIST);
    });

    return false;
  };

<<<<<<< HEAD
  const handleSubmit = () => {
    setLoading(true);
    const data = fields;
    axios.post(ROUTES_VEHICLES.LIST, data).then((response) => {
      const { id } = response.data;
      axios.patch(`vehicles/${id}/state_change`, { validationStatus: 'SUBMITTED' });
      setFields(emptyForm);
      setLoading(false);
    });
  };

  const orgMakes = [...new Set(vehicles.map((vehicle) => vehicle.make))];
=======
  const orgMakes = vehicles.map((vehicle) => vehicle.make);
>>>>>>> test
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
      fields={fields}
      formTitle="Enter ZEV"
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      handleSaveDraft={handleSaveDraft}
      loading={loading}
      makes={orgMakes}
      setFields={setFields}
      vehicleClasses={classes}
      vehicleTypes={types}
      vehicleYears={years}
    />
  );
};

VehicleAddContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
};

export default VehicleAddContainer;
