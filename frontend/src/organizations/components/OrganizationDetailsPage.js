import React from 'react';
import PropTypes from 'prop-types';

import UsersTable from './UsersTable';

const OrganizationDetailsPage = (props) => {
  const { details, loading, members } = props;
  const { organization } = details;

  if (loading) {
    return (
      <div>Loading...</div>
    );
  }

  return (
    <div id="organization-details" className="page">
      <div className="row">
        <div className="col-sm-12">
          <h1>{organization.name}</h1>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-6">
          <div className="organization-address">
            {organization.organizationAddress.addressLine1}
            <br />
            {organization.organizationAddress.city} {organization.organizationAddress.state}
            <br />
            {organization.organizationAddress.postalCode}
          </div>
        </div>

        <div className="col-sm-6">
          <div className="organization-info">
            Organization Class: B
            <br />
            2019 Compliance target: 55,000
            <br />
            Credit balance: 23,000-A / 28,000-B
          </div>
        </div>
      </div>

      <div className="row mt-5">
        <div className="col-sm-12">
          <h2>Users</h2>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12">
          <UsersTable
            items={members}
          />
        </div>
      </div>
    </div>
  );
};

OrganizationDetailsPage.defaultProps = {
};

OrganizationDetailsPage.propTypes = {
  details: PropTypes.shape({
    organization: PropTypes.shape({
      name: PropTypes.string,
      organizationAddress: PropTypes.shape({
        addressLine1: PropTypes.string,
        addressLine2: PropTypes.string,
        addressLine3: PropTypes.string,
        city: PropTypes.string,
        postalCode: PropTypes.string,
        state: PropTypes.string,
      }),
    }),
  }).isRequired,
  loading: PropTypes.bool.isRequired,
};

export default OrganizationDetailsPage;
