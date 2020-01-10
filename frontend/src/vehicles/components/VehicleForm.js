import React from 'react';

const VehicleForm = () => (
  <div id="vehicle-form" className="page">
    <div className="row">
      <div className="col-sm-12">
        <h1>Enter ZEV</h1>
      </div>
    </div>

    <form>
      <div className="row">
        <div className="col-sm-6">
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
                  placeholder="505"
                  type="text"
                />
              </div>
            </div>
          </fieldset>
        </div>

        <div className="col-sm-6">
          <div className="form-group">
            <label htmlFor="vin">
              VIN
            </label>

            <input
              className="form-control"
              id="vin"
              placeholder="###A13FC##3######"
              type="text"
            />
          </div>
        </div>
      </div>
    </form>
  </div>
);

VehicleForm.defaultProps = {
};

VehicleForm.propTypes = {
};

export default VehicleForm;
