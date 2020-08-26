/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import CustomPropTypes from '../app/utilities/props';
import VehicleForm from './components/VehicleForm';
import ROUTES_VEHICLES from '../app/routes/Vehicles';
import history from '../app/History';
import parseErrorResponse from '../app/utilities/parseErrorResponse';

const VehicleAddContainer = (props) => {
  const emptyForm = {
    hasPassedUs06Test: false,
    make: '',
    modelName: '',
    vehicleZevType: { vehicleZevCode: '--' },
    range: '',
    modelYear: { name: '--' },
    vehicleClassCode: { vehicleClassCode: '--' },
    weightKg: '',
  };
  const [errorFields, setErrorFields] = useState({});
  const [fields, setFields] = useState(emptyForm);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progressBars, setProgressBars] = useState({});
  const [showProgressBars, setShowProgressBars] = useState(false);
  const [types, setTypes] = useState([]);
  const [years, setYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const { keycloak } = props;


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

  const handleUpload = (id) => {
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

  const handleSubmit = (event, validationStatus = null) => {
    event.preventDefault();
    const data = fields;

    Object.keys(data).forEach((key) => {
      if (typeof data[key] === 'string') {
        data[key] = data[key].trim();
      }
    });

    axios.post(ROUTES_VEHICLES.LIST, data).then((response) => {
      const { id } = response.data;

      if (validationStatus) {
        axios.patch(`vehicles/${id}/state_change`, { validationStatus });
      }

      const promises = handleUpload(id);

      if (files.length > 0) {
        Promise.all(promises).then((attachments) => {
          if (attachments.length > 0) {
            data.vehicleAttachments = attachments;
          }

          axios.patch(ROUTES_VEHICLES.DETAILS.replace(/:id/gi, id), {
            ...data,
          }).then(() => {
            if (validationStatus === 'SUBMITTED') {
              setFields(emptyForm);
            } else {
              history.push(ROUTES_VEHICLES.LIST);
            }
          });
        });
      } else if (validationStatus === 'SUBMITTED') {
        setFields(emptyForm);
      } else {
        history.push(ROUTES_VEHICLES.LIST);
      }
    }).catch((errors) => {
      if (!errors.response) {
        return;
      }

      const { data: errorData } = errors.response;
      const err = {};

      parseErrorResponse(err, errorData);
      setErrorFields(err);
    });
  };

  const orgMakes = [...new Set(vehicles.map((vehicle) => vehicle.make))];
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
      errorFields={errorFields}
      fields={fields}
      files={files}
      formTitle="Enter ZEV"
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      loading={loading}
      makes={orgMakes}
      progressBars={progressBars}
      setFields={setFields}
      setUploadFiles={setFiles}
      showProgressBars={showProgressBars}
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
