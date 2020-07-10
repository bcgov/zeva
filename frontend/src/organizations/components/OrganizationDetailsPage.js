import React from 'react';
import PropTypes from 'prop-types';

import Loading from '../../app/components/Loading';
import CustomPropTypes from '../../app/utilities/props';
import UsersTable from './UsersTable';

const OrganizationDetailsPage = (props) => {
  const { details, loading, members } = props;

  if (loading) {
    return <Loading />;
  }

  return (
    <div id="organization-details" className="page">
      <div className="row">
        <div className="col-sm-12">
          <h1>{details.name}</h1>
        </div>
      </div>

      <div className="row">
        <div className="col-sm-6">
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
  members: [],
};

OrganizationDetailsPage.propTypes = {
  details: CustomPropTypes.organizationDetails.isRequired,
  loading: PropTypes.bool.isRequired,
  members: PropTypes.arrayOf(PropTypes.shape()),
};

export default OrganizationDetailsPage;
