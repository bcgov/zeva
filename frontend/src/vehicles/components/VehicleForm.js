import PropTypes from 'prop-types';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Loading from '../../app/components/Loading';
import VehicleFormDropdown from './VehicleFormDropdown';

const VehicleForm = (props) => {
  const {
    loading,
    vehicleMakes,
    vehicleModels,
    vehicleYears,
    vehicleTypes,
    handleInputChange,
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

      <form>
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
  handleInputChange: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  vehicleMakes: PropTypes.arrayOf(PropTypes.object).isRequired,
  vehicleModels: PropTypes.arrayOf(PropTypes.object).isRequired,
  vehicleTypes: PropTypes.arrayOf(PropTypes.object).isRequired,
  vehicleYears: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default VehicleForm;
