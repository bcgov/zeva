import React from 'react';
import PropTypes from 'prop-types';
import formatNumeric from '../../app/utilities/formatNumeric';

const SummarySupplierInfo = (props) => {
  const {
    supplierDetails,
    makes,
    creditActivityDetails,
    modelYear,
  } = props;
  const { supplierClassText } = creditActivityDetails;
  const { organization } = supplierDetails;
  return (
    <>
      <h3>Supplier Information</h3>
      <div className="mt-3">

        <h4 className="d-inline">Legal Name: </h4>
        <span className="text-black"> {organization.name} </span>
      </div>

      <div>
        <div className="d-block mr-5 mt-3">
          <h4>Service Address:</h4>
          {organization.organizationAddress
  && organization.organizationAddress.map((address) => (
    address.addressType.addressType === 'Service' && (
      <div key={address.id}>
        {address.representativeName && (
          <div className="text-black"> {address.representativeName} </div>
        )}
        <div className="text-black"> {address.addressLine1} </div>
        <div className="text-black"> {address.addressLine2} </div>
        <div className="text-black"> {address.city} {address.state} {address.country} </div>
        <div className="text-black"> {address.postalCode} </div>
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
          <div className="text-black"> {address.representativeName} </div>
        )}
        <div className="text-black"> {address.addressLine1} </div>
        <div className="text-black"> {address.addressLine2} </div>
        <div className="text-black"> {address.city} {address.state} {address.country} </div>
        <div className="text-black"> {address.postalCode} </div>
      </div>
    )
  ))}
        </div>
        <div className="mt-3">
          <h4 className="d-inline">Vehicle Supplier Class:</h4>
          <span className="text-black"> {supplierClassText} </span>
        </div>
        <div className="mt-3">
          <div className="d-inline font-weight-bold">3 Year Average ({ modelYear - 3}-{modelYear - 1}) LDV Sales\Leases:</div>
          <span className="text-black"> {formatNumeric(organization.avgLdvSales, 0)} </span>
        </div>
        <div className="d-block my-3">
          <h4>Makes:</h4>
          {makes.map((each) => <div className="text-black" key={each}>&bull; &nbsp; &nbsp; {each}</div>)}
        </div>
      </div>
    </>
  );
};
SummarySupplierInfo.propTypes = {
  supplierDetails: PropTypes.shape().isRequired,
  makes: PropTypes.arrayOf(PropTypes.string).isRequired,
  creditActivityDetails: PropTypes.shape().isRequired,
  modelYear: PropTypes.number.isRequired,
};
export default SummarySupplierInfo;
