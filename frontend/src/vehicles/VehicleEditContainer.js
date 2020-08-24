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

  const handleInputChange = (event) => {
    const {
      checked,
      name,
      type,
      value,
    } = event.target;

    let input = value;
    if (name === 'make') {
      input = input.toUpperCase();
    }

    if (type === 'checkbox') {
      fields[name] = checked;
    } else {
      fields[name] = input;
    }

    setFields({
      ...fields,
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

  const handleSubmit = () => {
    setLoading(true);
    const data = fields;

    Object.keys(data).forEach((key) => {
      if (typeof data[key] === 'string') {
        data[key] = data[key].trim();
      }
    });

    const promises = handleUpload();
    Promise.all(promises).then((attachments) => {
      if (attachments.length > 0) {
        data.vehicleAttachments = attachments;
      }

      axios.patch(ROUTES_VEHICLES.DETAILS.replace(/:id/gi, id), {
        ...data,
        deleteFiles,
      }).then(() => {
        axios.patch(`vehicles/${id}/state_change`, { validationStatus: 'SUBMITTED' }).then(() => {
          setLoading(false);
          history.push(`/vehicles/${id}`);
        });
      });
    });
  };

  const handleSaveDraft = (event) => {
    event.preventDefault();
    const data = fields;

    Object.keys(data).forEach((key) => {
      if (typeof data[key] === 'string') {
        data[key] = data[key].trim();
      }
    });

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

  const loadVehicle = (data) => {
    setFields({
      attachments: data.attachments,
      hasPassedUs06Test: data.hasPassedUs06Test,
      make: data.make,
      modelName: data.modelName,
      modelYear: data.modelYear.name,
      range: data.range,
      vehicleClassCode: data.vehicleClassCode.vehicleClassCode,
      vehicleZevType: data.vehicleZevType.vehicleZevCode,
      weightKg: data.weightKg,
    });
  };

  const orgMakes = [...new Set(vehicles.map((vehicle) => vehicle.make))];
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
        loadVehicle(vehicleRes.data),
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
      handleSaveDraft={handleSaveDraft}
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
