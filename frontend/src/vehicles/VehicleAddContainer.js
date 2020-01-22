/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import VehicleForm from './components/VehicleForm';

const VehicleAddContainer = (props) => {
  const [loading, setLoading] = useState(true);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [trims, setTrims] = useState([]);
  const [types, setTypes] = useState([]);
  const [years, setYears] = useState([]);
  const { keycloak } = props;

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
};

export default VehicleAddContainer;
