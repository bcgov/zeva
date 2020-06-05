import PropTypes from 'prop-types';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import History from '../../app/History';
import Loading from '../../app/components/Loading';
import VehicleFormDropdown from './VehicleFormDropdown';
import TextInput from '../../app/components/TextInput';
import AutocompleteInput from '../../app/components/AutocompleteInput';

const VehicleForm = (props) => {
  const {
    makes,
    loading,
    vehicleYears,
    vehicleTypes,
    handleInputChange,
    handleSubmit,
    vehicleClasses,
    fields,
    formTitle,
    setFields,
  } = props;
  if (loading) {
    return (<Loading />);
  }
  return (
    <div id="form" className="page">
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
              <AutocompleteInput
                label="Make"
                id="make"
                defaultValue={fields.make}
                handleInputChange={handleInputChange}
                mandatory
                possibleChoicesList={makes}
                setFields={setFields}
                fields={fields}
              />
              <TextInput
                label="Model"
                id="modelName"
                name="modelName"
                defaultValue={fields.modelName}
                handleInputChange={handleInputChange}
                mandatory
              />
              <VehicleFormDropdown
                accessor={(zevType) => zevType.vehicleZevCode}
                dropdownName="ZEV Type"
                dropdownData={vehicleTypes}
                fieldName="vehicleZevType"
                handleInputChange={handleInputChange}
                selectedOption={fields.vehicleZevType.vehicleZevCode}
              />
              <TextInput
                label="Electric Range (km)"
                id="range"
                name="range"
                defaultValue={fields.range}
                handleInputChange={handleInputChange}
                mandatory
              />
              <VehicleFormDropdown
                accessor={(classCode) => classCode.vehicleClassCode}
                dropdownName="Vehicle Class"
                dropdownData={vehicleClasses}
                fieldName="vehicleClassCode"
                handleInputChange={handleInputChange}
                selectedOption={fields.vehicleClassCode.vehicleClassCode}
              />
              <TextInput
                num
                label="GVWR (kg)"
                id="weightKg"
                name="weightKg"
                defaultValue={fields.weightKg}
                handleInputChange={handleInputChange}
                mandatory
              />
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
  vehicleTypes: PropTypes.arrayOf(PropTypes.object).isRequired,
  vehicleYears: PropTypes.arrayOf(PropTypes.object).isRequired,
  vehicleClasses: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default VehicleForm;
