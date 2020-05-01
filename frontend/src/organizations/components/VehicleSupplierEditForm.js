import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CustomPropTypes from '../../app/utilities/props';
import UserDetailsTextInput from './UserDetailsTextInput';
import Loading from '../../app/components/Loading';
import History from '../../app/History';

const VehicleSupplierEditForm = (props) => {
  const {
    details,
    display,
    loading,
    user,
    handleInputChange,
    handleSubmit,
    setEditForm,
    handleAddressChange,
  } = props;


  let addressDetails = {};
  if (details.organizationAddress) {
    addressDetails = {
      ...details.organizationAddress,
    };
  }

  let addressDisplay = {};
  if (display.organizationAddress) {
    addressDisplay = {
      ...display.organizationAddress,
    };
  }

  if (loading) {
    return <Loading />;
  }
  return (
    <div id="supplier-detail-form" className="page">
      <div className="row">
        <div className="col-md-12">
          <h4>Edit Supplier</h4>
          <h5>{display.name} {display.shortName && `(${display.shortName})`}</h5>
          {display.organizationAddress && (
          <p>
            {addressDisplay.addressLine1} {addressDisplay.addressLine2} {addressDisplay.city} {addressDisplay.state} {addressDisplay.postalCode}
          </p>
          )}
        </div>
      </div>
      <form onSubmit={(event) => handleSubmit(event)}>
        <div className="row align-items-center">
          <fieldset>
            <div className="form-layout row">
              <span>
                <div className="form-group row">
                  <label
                    className="col-sm-4 col-form-label"
                    htmlFor="active"
                  >
                        Supplier Status
                  </label>
                  <div className="col-sm-8" id="radio">
                    <div>

                      <input
                        type="radio"
                        id="active"
                        onChange={handleInputChange}
                        name="isActive"
                        value="true"
                        defaultChecked={details.isActive}
                      />
                    Actively supplying vehicles in B.C.
                    </div>
                    <div>
                      <input
                        type="radio"
                        id="inactive"
                        onChange={handleInputChange}
                        name="isActive"
                        value="false"
                        defaultChecked={!details.isActive}
                      />
                    Inactive
                    </div>
                  </div>
                </div>
                
                <UserDetailsTextInput
                  label="Legal Organization Name"
                  id="LegalOrganizationName"
                  name="name"
                  defaultValue={details.name}
                  handleInputChange={handleInputChange}
                  mandatory
                />
                <UserDetailsTextInput
                  label="Common Name"
                  id="CommonName"
                  name="shortName"
                  defaultValue={details.shortName}
                  handleInputChange={handleInputChange}
                />
                <UserDetailsTextInput
                  label="Street Address/PO Box"
                  id="StreetAddress"
                  name="addressLine_1"
                  defaultValue={addressDetails.addressLine1}
                  handleInputChange={handleAddressChange}
                  mandatory
                />
                <UserDetailsTextInput
                  label="Address Other (optional)"
                  id="addressLine2"
                  name="addressLine_2"
                  defaultValue={addressDetails.addressLine2}
                  handleInputChange={handleAddressChange}
                />
                <UserDetailsTextInput
                  label="City"
                  id="City"
                  name="city"
                  defaultValue={addressDetails.city}
                  handleInputChange={handleAddressChange}
                  mandatory
                />
                <UserDetailsTextInput
                  label="Province/State/Region"
                  id="Province"
                  name="state"
                  defaultValue={addressDetails.state}
                  handleInputChange={handleAddressChange}
                  mandatory
                />
                <UserDetailsTextInput
                  label="Country"
                  id="Country"
                  name="country"
                  defaultValue={addressDetails.country}
                  handleInputChange={handleAddressChange}
                  mandatory
                />
                <UserDetailsTextInput
                  label="Postal/ZIP Code"
                  id="PostalCode"
                  name="postalCode"
                  defaultValue={addressDetails.postalCode}
                  handleInputChange={handleAddressChange}
                  mandatory
                />

              </span>
            </div>
            <div className="action-bar form-group row">
              <span className="left-content">
                <button
                  className="button"
                  type="button"
                  onClick={() => {
                    setEditForm(false);
                    History.goBack();
                  }}
                >
                  <FontAwesomeIcon icon="arrow-left" /> Back
                </button>
              </span>

              <span className="right-content">
                <button className="button primary" type="button" onClick={handleSubmit}>
                  <FontAwesomeIcon icon="save" /> Save
                </button>
              </span>
            </div>
          </fieldset>
        </div>
      </form>
    </div>
  );
};
// VehicleSupplierEditForm.propTypes = {
//   user: CustomPropTypes.user.isRequired,
// };

export default VehicleSupplierEditForm;
