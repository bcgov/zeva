import React from 'react';

const SummarySupplierInfo = (props) => {
  const { supplierInformationDetails } = props;
  const { organization, supplierInformation } = supplierInformationDetails
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
          {supplierInformation.makes.map((each) => `•  ${each}`)}
        </div>
      </div>
    </>
  );
};
export default SummarySupplierInfo;
