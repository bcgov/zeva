import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import VehicleFormDropdown from './VehicleFormDropdown';
import Loading from '../../app/components/Loading';

const VehicleForm = (props) => {
  const {
    loading,
    vehicleMakes,
    vehicleModels,
    vehicleYears,
    vehicleTypes,
    vehicleTrims,
    handleInputChange,
    handleSubmit,
  } = props;
  if (loading) {
    return <Loading />;
  }
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
              />
              <VehicleFormDropdown
                dropdownName="Make"
                dropdownData={vehicleMakes}
              />
              <VehicleFormDropdown
                dropdownName="Model"
                dropdownData={vehicleModels}
              />
              <VehicleFormDropdown
                dropdownName="Type"
                dropdownData={vehicleTypes}
              />
              <VehicleFormDropdown
                dropdownName="Trim (Optional)"
                dropdownData={vehicleTrims}
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
                    placeholder="505"
                    type="text"
                  />
                </div>
              </div>

              <div className="action-bar form-group row">
                <span className="left-content">
                  <button className="button" type="button">
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

          <div className="col-md-6">
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

VehicleForm.defaultProps = {
};

VehicleForm.propTypes = {
  loading: PropTypes.bool.isRequired,
  vehicleMakes: PropTypes.arrayOf(PropTypes.object).isRequired,
  vehicleModels: PropTypes.arrayOf(PropTypes.object).isRequired,
  vehicleTrims: PropTypes.arrayOf(PropTypes.object).isRequired,
  vehicleTypes: PropTypes.arrayOf(PropTypes.object).isRequired,
  vehicleYears: PropTypes.arrayOf(PropTypes.object).isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};

export default VehicleForm;
