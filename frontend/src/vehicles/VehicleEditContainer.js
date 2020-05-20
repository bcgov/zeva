/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import VehicleForm from './components/VehicleForm';
import ROUTES_VEHICLES from '../app/routes/Vehicles';
import history from '../app/History';

const VehicleEditContainer = (props) => {
  const [fields, setFields] = useState({});
  const [loading, setLoading] = useState(true);
  const [types, setTypes] = useState([]);
  const [years, setYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const { keycloak } = props;
  const { id } = useParams();
  const [edits, setEdits] = useState({});
  const handleInputChange = (event) => {
    const { value, name } = event.target;
    setEdits(
      {
        ...edits,
        [name]: value,
      },
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = edits;
    axios.patch(ROUTES_VEHICLES.DETAILS.replace(/:id/gi, id), data).then(() => {
      history.push(`/vehicles/${id}`);
    });
  };

  const refreshList = () => {
    setLoading(true);
    axios.all([
      axios.get(ROUTES_VEHICLES.YEARS),
      axios.get(ROUTES_VEHICLES.ZEV_TYPES),
      axios.get(ROUTES_VEHICLES.DETAILS.replace(/:id/gi, id)),
      axios.get(ROUTES_VEHICLES.CLASSES),
    ]).then(axios.spread((yearsRes, typesRes, vehicleRes, classesRes) => (
      [setYears(yearsRes.data),
        setTypes(typesRes.data),
        setFields(vehicleRes.data),
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
      vehicleYears={years}
      vehicleTypes={types}
      fields={fields}
      vehicleClasses={classes}
      formTitle="Edit ZEV"
    />
  );
};

VehicleEditContainer.propTypes = {
  keycloak: PropTypes.shape().isRequired,
};

export default VehicleEditContainer;
