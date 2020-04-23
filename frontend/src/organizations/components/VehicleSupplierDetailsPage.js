import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Loading from '../../app/components/Loading';
import CustomPropTypes from '../../app/utilities/props';

const VehicleSupplierDetailsPage = (props) => {
  const { details, loading, vehicles } = props;

  if (loading) {
    return <Loading />;
  }

  return (
    <div id="vehicle-supplier-details" className="page">
      <div className="row">
        <h5>Status</h5>
      </div>

      <div className="row">
        <h5>Address</h5>
        {details.organizationAddress && (
          <div className="organization-address">
            {details.organizationAddress.addressLine1}
            <br />
            {details.organizationAddress.city} {details.organizationAddress.state}
            <br />
            {details.organizationAddress.postalCode}
          </div>
        )}
      </div>
      <div className="row">
        <h5>Supplier Class</h5>
        Organization Class: {(details.id % 2) ? 'Medium' : 'Large'}
        <br />
        2019 Compliance target: 55,000
      </div>
      <div className="row">
        <h5>Credit Balance</h5>
        Credit balance: 23,000-A / 28,000-B
      </div>
    </div>
  );
};

VehicleSupplierDetailsPage.defaultProps = {
  vehicles: [],
};

VehicleSupplierDetailsPage.propTypes = {
  details: CustomPropTypes.organizationDetails.isRequired,
  loading: PropTypes.bool.isRequired,
  vehicles: PropTypes.arrayOf(PropTypes.shape({})),
};

export default VehicleSupplierDetailsPage;
