import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';

import history from '../../app/History';

const VehicleForm = (props) => {
  const { handleInputChange, handleSubmit } = props;

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

              <div className="form-group row">
                <label
                  className="col-sm-2 col-form-label"
                  htmlFor="make"
                >
                  Make
                </label>

                <div className="col-sm-10">
                  <input
                    className="form-control"
                    id="make"
                    name="make"
                    onChange={handleInputChange}
                    placeholder="Optimus Prime"
                    type="text"
                  />
                </div>
              </div>

              <div className="form-group row">
                <label
                  className="col-sm-2 col-form-label"
                  htmlFor="model"
                >
                  Model
                </label>

                <div className="col-sm-10">
                  <input
                    className="form-control"
                    id="model"
                    name="model"
                    onChange={handleInputChange}
                    placeholder="Model A"
                    type="text"
                  />
                </div>
              </div>

              <div className="form-group row">
                <label
                  className="col-sm-2 col-form-label"
                  htmlFor="model-year"
                >
                  Model Year
                </label>

                <div className="col-sm-10">
                  <input
                    className="form-control"
                    id="model-year"
                    name="modelYear"
                    onChange={handleInputChange}
                    placeholder="2019"
                    type="text"
                  />
                </div>
              </div>

              <div className="form-group row">
                <label
                  className="col-sm-2 col-form-label"
                  htmlFor="bev"
                >
                  Type
                </label>

                <div className="col-sm-10">
                  <select
                    className="form-control"
                    id="bev"
                    name="bev"
                    onChange={handleInputChange}
                  >
                    <option>BEV</option>
                  </select>
                </div>
              </div>

              <div className="form-group row">
                <label
                  className="col-sm-2 col-form-label"
                  htmlFor="trim"
                >
                  Trim
                </label>

                <div className="col-sm-10">
                  <input
                    className="form-control"
                    id="trim"
                    name="trim"
                    onChange={handleInputChange}
                    placeholder="XL"
                    type="text"
                  />
                </div>
              </div>

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
                    onChange={handleInputChange}
                    placeholder="505"
                    type="text"
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
  handleSubmit: PropTypes.func.isRequired,
};

export default VehicleForm;
