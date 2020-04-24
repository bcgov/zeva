import React from 'react';
import PropTypes from 'prop-types';


import Loading from '../../app/components/Loading';
import CustomPropTypes from '../../app/utilities/props';

const VehicleSupplierDetailsPage = (props) => {
  const { details, loading, editButton } = props;
  if (loading) {
    return <Loading />;
  }
  const supplierClassSize = () => {
    if (details.id % 2) {
      return 'Large – 8,000+ vehicles sold per year on average';
    }
    return 'Medium – 1,000-7,999 vehicles sold per year on average';
    // } else {
    //   return'Small – under 1,000 vehicles sold per year on average' ;
    // }
  };
  return (
    <div id="vehicle-supplier-details" className="page">
      <div className="row">
        <div className="col-sm-10">
          <h4>Status</h4>
          <p className="supplier-text">
            {(details.isActive) ? 'Actively supplying vehicles in British Columbia' : 'Not actively supplying vehicles in British Columbia'}
          </p>
          <h4>Address</h4>
          <div className="organization-address">
            {details.organizationAddress && (
            <p className="supplier-text">
              {details.organizationAddress.addressLine1}
              <br />
              {details.organizationAddress.city} {details.organizationAddress.state}
              <br />
              {details.organizationAddress.postalCode}
            </p>
            )}
          </div>
          <h4>Supplier Class</h4>
          <p className="supplier-text">
            {supplierClassSize()}
          </p>
          <h4>Credit Balance</h4>
          <p className="supplier-text">A-{details.balance.A} — B-{details.balance.B}</p>
        </div>
        <div className="col-sm-2">
          {editButton}
        </div>
      </div>
    </div>
  );
};

VehicleSupplierDetailsPage.propTypes = {
  details: CustomPropTypes.organizationDetails.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default VehicleSupplierDetailsPage;
