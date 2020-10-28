import React from 'react';
import PropTypes from 'prop-types';

import TextInput from '../../app/components/TextInput';

const AddressForm = (props) => {
  const {
    errorFields,
    handleAddressChange,
    addressDetails,
    type,
    serviceSame,
    setServiceSame,
  } = props;
  const handleCheckboxClick = (event) => {
    const { checked } = event.target;
    setServiceSame(checked);
  };
  let title;
  if (type === 'Service') {
    title = 'Service Address';
  } else {
    title = 'Records Address';
  }
  return (
    <>

      {type === 'Service' && (
      <>
        <div className="form-group row mb-0">
          <div className="col-12">
            <h3 className="d-inline mr-2">{title}</h3>
            <span className="text-blue d-md-block d-lg-inline">(must be a B.C. address)</span>
          </div>
        </div>
        <TextInput
          addressType={type}
          defaultValue={addressDetails[`${type}_representativeName`] || ''}
          disabled={false}
          handleInputChange={handleAddressChange}
          id="RepresentativeName"
          inputSize="col-lg-12 col-xl-7"
          label="Name of Representative (optional)"
          labelSize={`col-lg-12 col-xl-5 col-form-label ${type === 'Service' ? '' : 'd-xl-none'}`}
          name={`${type}_representativeName`}
          serviceSame={serviceSame}
          rowSize="form-group row mt-0"
        />
      </>
      )}

      {type === 'Records' && (
      <div className="form-group row records-address">
        <div className="col-12">
          <h3 className="d-lg-block d-xl-inline d-md-block mr-3 d-sm-block">{title}</h3>
          <div className="d-sm-block d-md-block d-lg-block mt-4">
            <input className="d-inline-block align-middle" type="checkbox" id="records-address-checkbox" onChange={(event) => { handleCheckboxClick(event); }} />
            <span className="d-inline-block" htmlFor="records-address">
              same as service address
            </span>
          </div>
        </div>
      </div>
      )}
      <TextInput
        addressType={type}
        defaultValue={addressDetails[`${type}_addressLine_1`] || ''}
        disabled={serviceSame}
        errorMessage={'addressLine1' in errorFields && errorFields.addressLine1}
        handleInputChange={handleAddressChange}
        id="StreetAddress"
        inputSize={type === 'Service' ? 'col-lg-12 col-xl-7' : 'col-xl-12'}
        label="Street Address/PO Box"
        labelSize={`col-lg-12 col-xl-5 col-form-label ${type === 'Service' ? '' : 'd-xl-none'}`}
        mandatory
        name={`${type}_addressLine_1`}
        serviceSame={serviceSame}
      />
      <TextInput
        addressType={type}
        defaultValue={addressDetails[`${type}_addressLine_2`] || ''}
        disabled={serviceSame}
        handleInputChange={handleAddressChange}
        id="addressLine2"
        inputSize={type === 'Service' ? 'col-lg-12 col-xl-7' : 'col-xl-12'}
        label="Address Other (optional)"
        labelSize={`col-lg-12 col-xl-5 col-form-label ${type === 'Service' ? '' : 'd-xl-none'}`}
        name={`${type}_addressLine_2`}
        serviceSame={serviceSame}
      />
      <TextInput
        addressType={type}
        defaultValue={addressDetails[`${type}_city`] || ''}
        disabled={serviceSame}
        errorMessage={'city' in errorFields && errorFields.city}
        handleInputChange={handleAddressChange}
        id="City"
        inputSize={type === 'Service' ? 'col-lg-12 col-xl-7' : 'col-xl-12'}
        label="City"
        labelSize={`col-lg-12 col-xl-5 col-form-label ${type === 'Service' ? '' : 'd-xl-none'}`}
        mandatory
        name={`${type}_city`}
        serviceSame={serviceSame}
      />
      <TextInput
        addressType={type}
        defaultValue={type === 'Service' ? 'BC' : addressDetails[`${type}_state`]}
        disabled={serviceSame}
        errorMessage={'state' in errorFields && errorFields.state}
        handleInputChange={handleAddressChange}
        id="Province"
        inputSize={type === 'Service' ? 'col-lg-12 col-xl-7' : 'col-xl-12'}
        label="Province/State/Region"
        labelSize={`col-lg-12 col-xl-5 col-form-label ${type === 'Service' ? '' : 'd-xl-none'}`}
        mandatory
        name={`${type}_state`}
        readonly={type === 'Service'}
        serviceSame={serviceSame}
      />
      <TextInput
        addressType={type}
        defaultValue={type === 'Service' ? 'Canada' : addressDetails[`${type}_country`]}
        disabled={serviceSame}
        errorMessage={'country' in errorFields && errorFields.country}
        handleInputChange={handleAddressChange}
        id="Country"
        inputSize={type === 'Service' ? 'col-lg-12 col-xl-7' : 'col-xl-12'}
        label="Country"
        labelSize={`col-lg-12 col-xl-5 col-form-label ${type === 'Service' ? '' : 'd-xl-none'}`}
        mandatory
        name={`${type}_country`}
        readonly={type === 'Service'}
        serviceSame={serviceSame}
      />
      <TextInput
        addressType={type}
        defaultValue={addressDetails[`${type}_postalCode`] || ''}
        disabled={serviceSame}
        errorMessage={'postalCode' in errorFields && errorFields.postalCode}
        handleInputChange={handleAddressChange}
        id="PostalCode"
        inputSize={type === 'Service' ? 'col-lg-12 col-xl-7' : 'col-xl-12'}
        label="Postal/ZIP Code"
        labelSize={`col-lg-12 col-xl-5 col-form-label ${type === 'Service' ? '' : 'd-xl-none'}`}
        mandatory
        name={`${type}_postalCode`}
        serviceSame={serviceSame}
      />
    </>
  );
};
AddressForm.defaultProps = {
  setServiceSame: () => {},
  type: '',
  serviceSame: false,
};
AddressForm.propTypes = {
  type: PropTypes.string,
  serviceSame: PropTypes.bool,
  setServiceSame: PropTypes.func,
  errorFields: PropTypes.shape({
    addressLine1: PropTypes.string,
    city: PropTypes.string,
    country: PropTypes.string,
    postalCode: PropTypes.string,
    state: PropTypes.string,
  }).isRequired,
  handleAddressChange: PropTypes.func.isRequired,
  addressDetails: PropTypes.shape({}).isRequired,
};

export default AddressForm;
