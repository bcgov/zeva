import React from 'react';
import PropTypes from 'prop-types';

import Button from '../../app/components/Button';
import Loading from '../../app/components/Loading';
import CustomPropTypes from '../../app/utilities/props';
import ROUTES_ORGANIZATIONS from '../../app/routes/Organizations';

const VehicleSupplierDetailsPage = (props) => {
  const {
    details, loading, editButton, locationState,
  } = props;
  const { organizationAddress } = details;

  if (loading) {
    return <Loading />;
  }

  return (
    <div id="vehicle-supplier-details" className="page">
      <div className="row mt-2">
        <div className="col-sm-10">
          <h3>Status</h3>
          <p className="supplier-text">
            {(details.isActive) ? 'Actively supplying vehicles in British Columbia' : 'Not actively supplying vehicles in British Columbia'}
          </p>
          {organizationAddress && organizationAddress.map((each) => ([
            <h3 className="mt-3" key={`${each.id}-header`}>{each.addressType ? each.addressType.addressType : ''} Address</h3>,
            <div className="organization-address" key={each.id}>
              <div className="supplier-text">
                {(each.addressType.addressType === "Service") ? each.representativeName : ''}
                {each.addressLine1 && <div>{each.addressLine1}</div>}
                {each.addressLine2 && <div>{each.addressLine2}</div>}
                {each.addressLine3 && <div>{each.addressLine3}</div>}
                <div>{each.city} {each.state} {each.country}</div>
                {each.postalCode && <div>{each.postalCode}</div>}
              </div>
            </div>,
          ]))}
          <h3 className="mt-3">Credit Balance</h3>
          <p className="supplier-text">A-{details.balance.A} — B-{details.balance.B}</p>
        </div>
        <div className="col-sm-2">
          {editButton}
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="action-bar">
            <span className="left-content">
              <Button
                buttonType="back"
                locationRoute={ROUTES_ORGANIZATIONS.LIST}
                locationState={locationState}
              />
            </span>
            <span className="right-content" />
          </div>
        </div>
      </div>
    </div>
  );
};

VehicleSupplierDetailsPage.defaultProps = {
  locationState: undefined,
};

VehicleSupplierDetailsPage.propTypes = {
  details: CustomPropTypes.organizationDetails.isRequired,
  loading: PropTypes.bool.isRequired,
  locationState: PropTypes.arrayOf(PropTypes.shape()),
};

export default VehicleSupplierDetailsPage;
