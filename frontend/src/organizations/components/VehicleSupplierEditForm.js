import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import TextInput from '../../app/components/TextInput';
import Loading from '../../app/components/Loading';
import Modal from '../../app/components/Modal';
import History from '../../app/History';
import CustomPropTypes from '../../app/utilities/props';

const VehicleSupplierEditForm = (props) => {
  const {
    details,
    display,
    errorFields,
    handleAddressChange,
    handleInputChange,
    handleSubmit,
    loading,
    newSupplier,
    setDetails,
  } = props;
  const [showModal, setShowModal] = useState(false);
  const modal = (
    <Modal
      confirmClass="btn-outline-danger"
      confirmLabel="Make Inactive"
      handleCancel={() => {
        setShowModal(false);
        setDetails({
          ...details,
          isActive: true,
        });
      }}
      handleSubmit={() => {
        setShowModal(false);
        setDetails({
          ...details,
          isActive: false,
        });
      }}
      showModal={showModal}
      title="Make Supplier Inactive"
    >
      <p>You have selected to make this vehicle supplier Inactive. <br /><br />
      They will no longer have the ability to make any further changes
      within their account and all their users will have read only access
      </p><br />
      <p>Do you want to make this supplier Inactive?</p>
    </Modal>
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
    <div id="form" className="page">
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
          <fieldset className="col-lg-6">
            <div className="form-layout row">
              <div className="col-lg-12">
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
                          setDetails({
                            ...details,
                            isActive: true,
                          });
                        }}
                        name="isActive"
                        value="true"
                        checked={details.isActive === true}
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
                        checked={details.isActive === false}
                      />
                    Inactive
                    </div>
                  </div>
                  {setShowModal && modal}
                </div>

                <TextInput
                  defaultValue={details.name}
                  errorMessage={'name' in errorFields && errorFields.name}
                  handleInputChange={handleInputChange}
                  id="LegalOrganizationName"
                  label="Legal Organization Name"
                  mandatory
                  name="name"
                />
                <TextInput
                  defaultValue={details.shortName}
                  errorMessage={'shortName' in errorFields && errorFields.shortName}
                  handleInputChange={handleInputChange}
                  id="CommonName"
                  label="Common Name"
                  name="shortName"
                />
                <TextInput
                  defaultValue={addressDetails.addressLine1}
                  errorMessage={'addressLine1' in errorFields && errorFields.addressLine1}
                  handleInputChange={handleAddressChange}
                  id="StreetAddress"
                  label="Street Address/PO Box"
                  mandatory
                  name="addressLine_1"
                />
                <TextInput
                  label="Address Other (optional)"
                  id="addressLine2"
                  name="addressLine_2"
                  defaultValue={addressDetails.addressLine2}
                  handleInputChange={handleAddressChange}
                />
                <TextInput
                  defaultValue={addressDetails.city}
                  errorMessage={'city' in errorFields && errorFields.city}
                  handleInputChange={handleAddressChange}
                  id="City"
                  label="City"
                  mandatory
                  name="city"
                />
                <TextInput
                  defaultValue={addressDetails.state}
                  errorMessage={'state' in errorFields && errorFields.state}
                  handleInputChange={handleAddressChange}
                  id="Province"
                  label="Province/State/Region"
                  mandatory
                  name="state"
                />
                <TextInput
                  defaultValue={addressDetails.country}
                  errorMessage={'country' in errorFields && errorFields.country}
                  handleInputChange={handleAddressChange}
                  id="Country"
                  label="Country"
                  mandatory
                  name="country"
                />
                <TextInput
                  defaultValue={addressDetails.postalCode}
                  errorMessage={'postalCode' in errorFields && errorFields.postalCode}
                  handleInputChange={handleAddressChange}
                  id="PostalCode"
                  label="Postal/ZIP Code"
                  mandatory
                  name="postalCode"
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

VehicleSupplierEditForm.defaultProps = {
  errorFields: {},
};

VehicleSupplierEditForm.propTypes = {
  details: CustomPropTypes.organizationDetails.isRequired,
  display: CustomPropTypes.organizationDetails.isRequired,
  errorFields: PropTypes.shape(),
  handleAddressChange: PropTypes.func.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  newSupplier: PropTypes.bool.isRequired,
  setDetails: PropTypes.func.isRequired,
};

export default VehicleSupplierEditForm;
