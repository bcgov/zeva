import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CustomPropTypes from '../../app/utilities/props';
import UserDetailsTextInput from './UserDetailsTextInput';
import Loading from '../../app/components/Loading';
import History from '../../app/History';

const VehicleSupplierEditForm = (props) => {
  const {
    setDetails,
    details,
    display,
    loading,
    handleInputChange,
    handleSubmit,
    handleAddressChange,
    newSupplier,
  } = props;
  const [showModal, setShowModal] = useState(false);
  const [active, setActive] = useState(details.isActive);
  const modal = (
    <div className="modal" tabIndex="-1" role="dialog" style={showModal ? { display: 'block' } : { display: 'none' }}>
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Make Supplier Inactive</h5>
            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <p>You have selected to make this vehicle supplier Inactive. <br /><br />
            They will no longer have the ability to make any further changes
            within their account and all their users will have read only access
            </p><br />
            <p>Do you want to make this supplier Inactive?</p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              id="cancel"
              className="btn btn-outline-secondary"
              data-dismiss="modal"
              onClick={() => {
                setActive(true);
                setShowModal(false);
                setDetails({
                  ...details,
                  isActive: true,
                });
              }}
            >Cancel
            </button>
            <button
              type="button"
              id="set-inactive"
              className="btn btn-outline-danger"
              onClick={() => {
                setActive(false);
                setShowModal(false);
                setDetails({
                  ...details,
                  isActive: false,
                });
              }}
            >Make Inactive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
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
          <h4>{newSupplier ? 'Add' : 'Edit'} Supplier</h4>
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
                        onChange={() => {
                          setActive(true);
                          setDetails({
                            ...details,
                            isActive: true,
                          });
                        }}
                        name="isActive"
                        value="true"
                        checked={active === true}
                      />
                    Actively supplying vehicles in B.C.
                    </div>
                    <div>
                      <input
                        type="radio"
                        id="inactive"
                        onChange={() => setShowModal(true)}
                        name="isActive"
                        value="false"
                        checked={active === false}
                      />
                    Inactive
                    </div>
                  </div>
                  {setShowModal && modal}
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
VehicleSupplierEditForm.propTypes = {
  setDetails: PropTypes.func.isRequired,
  details: CustomPropTypes.organizationDetails.isRequired,
  display: CustomPropTypes.organizationDetails.isRequired,
  loading: PropTypes.bool.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleAddressChange: PropTypes.func.isRequired,
};

export default VehicleSupplierEditForm;
