import React from 'react';
import PropTypes from 'prop-types';

const SummarySupplierInfo = (props) => {
  const { supplierDetails, makes } = props;
  const { organization } = supplierDetails;
  return (
    <>
      <h3>Supplier Information</h3>
      <div className="mt-3">

        <h4 className="d-inline">Legal Name: </h4>
        <span> {organization.name} </span>
      </div>

      <div>
        <div className="d-block mr-5 mt-3">
          <h4>Service Address:</h4>
          {organization.organizationAddress
  && organization.organizationAddress.map((address) => (
    address.addressType.addressType === 'Service' && (
      <div key={address.id}>
        {address.representativeName && (
          <div> {address.representativeName} </div>
        )}
        <div> {address.addressLine1} </div>
        <div> {address.city} {address.state} {address.country} </div>
        <div> {address.postalCode} </div>
      </div>
    )
  ))}
        </div>
        <div className="d-block mt-3">
          <h4>Records Address:</h4>
          {organization.organizationAddress
  && organization.organizationAddress.map((address) => (
    address.addressType.addressType === 'Records' && (
      <div key={address.id}>
        {address.representativeName && (
          <div> {address.representativeName} </div>
        )}
        <div> {address.addressLine1} </div>
        <div> {address.city} {address.state} {address.country} </div>
        <div> {address.postalCode} </div>
      </div>
    )
  ))}
        </div>
        <div className="d-block my-3">
          <h4>Makes:</h4>
          {makes.map((each) => <div key={each}>•{each}</div>)}
        </div>
      </div>
    </>
  );
};
SummarySupplierInfo.propTypes = {
  supplierDetails: PropTypes.shape().isRequired,
  makes: PropTypes.arrayOf(PropTypes.string).isRequired,
};
export default SummarySupplierInfo;
