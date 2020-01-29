import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Loading from '../../app/components/Loading';
import history from '../../app/History';
import VehicleFormDropdown from './VehicleFormDropdown';

const VehicleForm = (props) => {
  const {
    loading,
    vehicleMakes,
    vehicleModels,
    vehicleYears,
    vehicleTypes,
    vehicleClasses,
    handleInputChange,
    handleSubmit,
    fields,
  } = props;


  if (loading) {
    return (<Loading />);
  }

  const [filteredModels, setFilteredModels] = useState([]);

  useEffect(() => {
    if ('make' in props.fields) {
      if (props.fields.make && props.fields.make !== '') {
        const { make } = props.fields;

        setFilteredModels(vehicleModels.filter(
          (vehicleModel) => vehicleModel.make.id === Number(make),
        ));
      }
    }
  },
  [fields]);

  return (
    <div id="vehicle-form" className="page">

      <div className="row">
        <div className="col-md-12">
          <h1>Enter ZEV</h1>
        </div>
      </div>

      <form onSubmit={(event) => handleSubmit(event)}>
        <div className="row align-items-center">
          <div className="col-md-6">
            <fieldset>
              <legend>Model Details</legend>
              <VehicleFormDropdown
                dropdownName="Model Year"
                dropdownData={vehicleYears}
                fieldName="modelYear"
                handleInputChange={handleInputChange}
              />
              <VehicleFormDropdown
                dropdownName="Make"
                dropdownData={vehicleMakes}
                fieldName="make"
                handleInputChange={handleInputChange}
              />
              <VehicleFormDropdown
                dropdownName="Model"
                dropdownData={filteredModels}
                fieldName="model"
                handleInputChange={handleInputChange}
              />
              <VehicleFormDropdown
                dropdownName="Type"
                dropdownData={vehicleTypes}
                fieldName="vehicleFuelType"
                handleInputChange={handleInputChange}
              />
              <VehicleFormDropdown
                dropdownName="Size"
                dropdownData={vehicleClasses}
                fieldName="vehicleClassCode"
                handleInputChange={handleInputChange}
              />
              <div className="form-group row">
                <label
                  className="col-sm-2 col-form-label"
                  htmlFor="range"
                >
                  Range (km)
                </label>
                <div className="col-sm-10">
                  <input
                    className="form-control"
                    id="range"
                    name="range"
                    type="text"
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="action-bar form-group row">
                <span className="left-content">
                  <button
                    className="button"
                    onClick={() => {
                      history.goBack();
                    }}
                    type="button"
                  >
                    <FontAwesomeIcon icon="arrow-left" /> Back
                  </button>
                </span>

                <span className="right-content">
                  <button className="button primary" type="submit">
                    <FontAwesomeIcon icon="save" /> Save
                  </button>
                </span>
              </div>
            </fieldset>
          </div>

          <div className="col-md-6" style={{ display: 'none' }}>
            <div className="form-group">
              <label htmlFor="vin">
                VIN
              </label>

              <input
                className="form-control"
                id="vin"
                name="vin"
                onChange={handleInputChange}
                placeholder="###A13FC##3######"
                type="text"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

VehicleForm.defaultProps = {};

VehicleForm.propTypes = {
  handleInputChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  fields: PropTypes.shape().isRequired,
  loading: PropTypes.bool.isRequired,
  vehicleMakes: PropTypes.arrayOf(PropTypes.object).isRequired,
  vehicleModels: PropTypes.arrayOf(PropTypes.object).isRequired,
  vehicleTypes: PropTypes.arrayOf(PropTypes.object).isRequired,
  vehicleYears: PropTypes.arrayOf(PropTypes.object).isRequired,
  vehicleClasses: PropTypes.arrayOf(PropTypes.object).isRequired,

};

export default VehicleForm;
