import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from '../../app/components/Button';
import TextInput from '../../app/components/TextInput';
import Loading from '../../app/components/Loading';
import Modal from '../../app/components/Modal';
import History from '../../app/History';
import CustomPropTypes from '../../app/utilities/props';
import AddressForm from './AddressForm';

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
    setServiceSame,
    serviceSame,
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

  if (loading) {
    return <Loading />;
  }
  return (
    <div id="form" className="page">
      <div className="row">
        <div className="col-md-12">
          <h2 className="mb-2">{newSupplier ? 'Add' : 'Edit'} Supplier</h2>
          {display && (
            <h3 className="mb-2">{display.name} {display.shortName && `(${display.shortName})`}</h3>
          )}
        </div>
      </div>
      <form onSubmit={(event) => handleSubmit(event)}>
        <div className="row align-items-center">
          <div className="col-lg-12 col-xl-11">
            <fieldset>
              <div className="form-layout row">
                <div className="col-lg-12">
                  <div className="form-group row">
                    <label
                      className="col-sm-3 col-form-label"
                      htmlFor="active"
                    >
                      Supplier Status
                    </label>
                    <div className="col-sm-9" id="radio">
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
                    labelSize="col-sm-3 col-form-label"
                    inputSize="col-sm-7"
                    defaultValue={details.name}
                    errorMessage={'name' in errorFields && errorFields.name}
                    handleInputChange={handleInputChange}
                    id="LegalOrganizationName"
                    label="Legal Organization Name"
                    mandatory
                    name="name"
                  />
                  <TextInput
                    labelSize="col-sm-3 col-form-label"
                    inputSize="col-sm-7"
                    defaultValue={details.shortName}
                    errorMessage={'shortName' in errorFields && errorFields.shortName}
                    handleInputChange={handleInputChange}
                    id="CommonName"
                    label="Common Name"
                    name="shortName"
                  />
                  <div className="row">
                    <div className="col-lg-7 col-md-6 pr-0">
                      <AddressForm
                        addressDetails={addressDetails}
                        addressType="Service"
                        errorFields={errorFields}
                        handleAddressChange={handleAddressChange}
                        type="Service"
                      />
                    </div>
                    <div className="d-sm-block d-md-none">&nbsp;</div>
                    <div className="col-lg-5 col-md-6">
                      <AddressForm
                        addressDetails={addressDetails}
                        addressType="Records"
                        errorFields={errorFields}
                        handleAddressChange={handleAddressChange}
                        serviceSame={serviceSame}
                        setServiceSame={setServiceSame}
                        type="Records"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="action-bar">
              <span className="left-content">
                <Button buttonType="back" />
              </span>

              <span className="right-content">
                <Button buttonType="save" optionalClassname="button primary" action={() => { handleSubmit(); }} />
              </span>
            </div>
          </div>
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
  serviceSame: PropTypes.bool.isRequired,
  setDetails: PropTypes.func.isRequired,
  setServiceSame: PropTypes.func.isRequired,
};

export default VehicleSupplierEditForm;
