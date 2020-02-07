import PropTypes from 'prop-types';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import History from '../../app/History';
import Loading from '../../app/components/Loading';
import VehicleFormDropdown from './VehicleFormDropdown';

const VehicleForm = (props) => {
  const {
    loading,
    vehicleMakes,
    vehicleYears,
    vehicleTypes,
    vehicleClasses,
    handleInputChange,
    handleSubmit,
    fields,
    formTitle,
  } = props;
  if (loading) {
    return (<Loading />);
  }

  return (
    <div id="vehicle-form" className="page">

      <div className="row">
        <div className="col-md-12">
          <h1>{formTitle}</h1>
        </div>
      </div>

      <form onSubmit={(event) => handleSubmit(event)}>
        <div className="row align-items-center">
          <div className="col-md-6">
            <fieldset>
              <legend>Model Details</legend>
              <VehicleFormDropdown
                accessor={(model) => model.name}
                dropdownName="Model Year"
                dropdownData={vehicleYears}
                fieldName="modelYear"
                handleInputChange={handleInputChange}
                selectedOption={fields.modelYear.name}
              />
              <VehicleFormDropdown
                accessor={(make) => make.name}
                dropdownName="Make"
                dropdownData={vehicleMakes}
                fieldName="make"
                handleInputChange={handleInputChange}
                selectedOption={fields.make.name}
              />
              <div className="form-group row">
                <label
                  className="col-sm-2 col-form-label"
                  htmlFor="modelName"
                >
                  Model
                </label>
                <div className="col-sm-10">
                  <input
                    className="form-control"
                    id="modelName"
                    name="modelName"
                    type="text"
                    defaultValue={fields.modelName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <VehicleFormDropdown
                accessor={(fuelType) => fuelType.vehicleFuelCode}
                dropdownName="Type"
                dropdownData={vehicleTypes}
                fieldName="vehicleFuelType"
                handleInputChange={handleInputChange}
                selectedOption={fields.vehicleFuelType.vehicleFuelCode}
              />
              <VehicleFormDropdown
                accessor={(classCode) => classCode.vehicleClassCode}
                dropdownName="Size"
                dropdownData={vehicleClasses}
                fieldName="vehicleClassCode"
                handleInputChange={handleInputChange}
                selectedOption={fields.vehicleClassCode.vehicleClassCode}
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
                    defaultValue={fields.range}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="action-bar form-group row">
                <span className="left-content">
                  <button
                    className="button"
                    type="button"
                    onClick={() => {
                      History.goBack();
                    }}
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
  fields: PropTypes.shape().isRequired,
  formTitle: PropTypes.string.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  vehicleMakes: PropTypes.arrayOf(PropTypes.object).isRequired,
  vehicleTypes: PropTypes.arrayOf(PropTypes.object).isRequired,
  vehicleYears: PropTypes.arrayOf(PropTypes.object).isRequired,
  vehicleClasses: PropTypes.arrayOf(PropTypes.object).isRequired,

};

export default VehicleForm;
