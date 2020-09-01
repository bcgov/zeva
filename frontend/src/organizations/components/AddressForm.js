import React, { useState } from 'react';
import TextInput from '../../app/components/TextInput';
import PropTypes from 'prop-types';

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
  let secondaryText;
  if (type === 'Records') {
    title = 'Records Address';
    secondaryText = '(must be a B.C. address)';
  } else {
    title = 'Service Address';
    secondaryText = '';
  }
  return (
    <span>
      <div className="form-group">
        <label>{title}</label>
        <h6 className="d-inline"> {secondaryText}</h6>

        {type === 'Service' && (
        <span>
          <input type="checkbox" id="service-address-checkbox" onChange={(event) => { handleCheckboxClick(event); }} />
          <h6 className="d-inline" htmlFor="service-address">
            same as records address
          </h6>
        </span>
        )}
      </div>
      <TextInput
        defaultValue={addressDetails[`${type}_addressLine_1`] || ''}
        errorMessage={'addressLine1' in errorFields && errorFields.addressLine1}
        handleInputChange={handleAddressChange}
        id="StreetAddress"
        label="Street Address/PO Box"
        mandatory
        name={`${type}_addressLine_1`}
        disabled={serviceSame}
        addressType={type}
        serviceSame={serviceSame}
      />
      <TextInput
        label="Address Other (optional)"
        id="addressLine2"
        name={`${type}_addressLine_2`}
        defaultValue={addressDetails[`${type}_addressLine_2`] || ''}
        handleInputChange={handleAddressChange}
        disabled={serviceSame}
        addressType={type}
        serviceSame={serviceSame}
      />
      <TextInput
        defaultValue={addressDetails[`${type}_city`] || ''}
        errorMessage={'city' in errorFields && errorFields.city}
        handleInputChange={handleAddressChange}
        id="City"
        label="City"
        mandatory
        name={`${type}_city`}
        disabled={serviceSame}
        addressType={type}
        serviceSame={serviceSame}
      />
      <TextInput
        defaultValue={type === 'Records' ? 'BC' : addressDetails[`${type}_state`]}
        errorMessage={'state' in errorFields && errorFields.state}
        handleInputChange={handleAddressChange}
        id="Province"
        label="Province/State/Region"
        mandatory
        name={`${type}_state`}
        disabled={serviceSame}
        readonly={type === 'Records'}
        addressType={type}
        serviceSame={serviceSame}
      />
      <TextInput
        defaultValue={type === 'Records' ? 'Canada' : addressDetails[`${type}_country`]}
        errorMessage={'country' in errorFields && errorFields.country}
        handleInputChange={handleAddressChange}
        id="Country"
        label="Country"
        mandatory
        name={`${type}_country`}
        disabled={serviceSame}
        readonly={type === 'Records'}
        addressType={type}
        serviceSame={serviceSame}
      />
      <TextInput
        defaultValue={addressDetails[`${type}_postalCode`] || ''}
        errorMessage={'postalCode' in errorFields && errorFields.postalCode}
        handleInputChange={handleAddressChange}
        id="PostalCode"
        label="Postal/ZIP Code"
        mandatory
        name={`${type}_postalCode`}
        disabled={serviceSame}
        addressType={type}
        serviceSame={serviceSame}
      />
    </span>
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
  errorFields: PropTypes.shape({}).isRequired,
  handleAddressChange: PropTypes.func.isRequired,
  addressDetails: PropTypes.shape({}).isRequired,
};

export default AddressForm;
