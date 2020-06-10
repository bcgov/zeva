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
  const [classes, setClasses] = useState([]);
  const [deleteFiles, setDeleteFiles] = useState([]);
  const [fields, setFields] = useState({});
  const [files, setFiles] = useState([]);
  const [progressBars, setProgressBars] = useState({});
  const [loading, setLoading] = useState(true);
  const [types, setTypes] = useState([]);
  const [showProgressBars, setShowProgressBars] = useState(false);
  const [years, setYears] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const { keycloak } = props;
  const { id } = useParams();
  const [edits, setEdits] = useState({});

  const handleInputChange = (event) => {
    const { value, name } = event.target;

    setEdits({
      ...edits,
      [name]: value,
    });
  };

  const updateProgressBars = (progressEvent, index) => {
    const percentage = Math.round((100 * progressEvent.loaded) / progressEvent.total);
    setProgressBars({
      ...progressBars,
      [index]: percentage,
    });

    progressBars[index] = percentage;
  };

  const handleUpload = () => {
    const promises = [];
    setShowProgressBars(true);

    files.forEach((file, index) => {
      promises.push(new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const blob = reader.result;

          axios.get(ROUTES_VEHICLES.MINIO_URL.replace(/:id/gi, id)).then((response) => {
            const { url: uploadUrl, minioObjectName } = response.data;

            axios.put(uploadUrl, blob, {
              headers: {
                Authorization: null,
              },
              onUploadProgress: (progressEvent) => {
                updateProgressBars(progressEvent, index);

                if (progressEvent.loaded >= progressEvent.total) {
                  resolve({
                    filename: file.name,
                    mimeType: file.type,
                    minioObjectName,
                    size: file.size,
                  });
                }
              },
            }).catch(() => {
              reject();
            });
          });
        };

        reader.readAsArrayBuffer(file);
      }));
    });

    return promises;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = edits;

    const promises = handleUpload();

    Promise.all(promises).then((attachments) => {
      if (attachments.length > 0) {
        data.vehicleAttachments = attachments;
      }

      axios.patch(ROUTES_VEHICLES.DETAILS.replace(/:id/gi, id), {
        ...data,
        deleteFiles,
      }).then(() => {
        history.push(`/vehicles/${id}`);
      });
    });
  };
  const orgMakes = vehicles.map((vehicle) => vehicle.make);
  const refreshList = () => {
    setLoading(true);
    axios.all([
      axios.get(ROUTES_VEHICLES.YEARS),
      axios.get(ROUTES_VEHICLES.ZEV_TYPES),
      axios.get(ROUTES_VEHICLES.DETAILS.replace(/:id/gi, id)),
      axios.get(ROUTES_VEHICLES.CLASSES),
      axios.get(ROUTES_VEHICLES.LIST),
    ]).then(axios.spread((yearsRes, typesRes, vehicleRes, classesRes, orgVehiclesRes) => (
      [setYears(yearsRes.data),
        setTypes(typesRes.data),
        setFields(vehicleRes.data),
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
      deleteFiles={deleteFiles}
      fields={fields}
      files={files}
      formTitle="Enter ZEV Model"
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      loading={loading}
      makes={orgMakes}
      progressBars={progressBars}
      setDeleteFiles={setDeleteFiles}
      setFields={setFields}
      setUploadFiles={setFiles}
      showProgressBars={showProgressBars}
      vehicleClasses={classes}
      vehicleTypes={types}
      vehicleYears={years}
    />
  );
};

VehicleEditContainer.propTypes = {
  keycloak: PropTypes.shape().isRequired,
};

export default VehicleEditContainer;
