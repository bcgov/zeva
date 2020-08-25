import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import history from '../../app/History';
import Loading from '../../app/components/Loading';
import ROUTES_ORGANIZATIONS from '../../app/routes/Organizations';
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
          <h1>{details.isGovernment ? details.name : 'Vehicle Supplier Information'}</h1>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12 col-lg-8 col-xl-6">
          {!details.isGovernment && details.organizationAddress && (
            <div className="organization-address">
              <div className="row">
                <div className="col-md-4">Legal name:</div>
                <div className="col-md-8 value">{details.name}</div>
              </div>
              <div className="row">
                <div className="col-md-4">Common name:</div>
                <div className="col-md-8 value">{details.shortName}</div>
              </div>
              <div className="row">
                <div className="col-md-4">Address:</div>
                <div className="col-md-8 value">
                  {details.organizationAddress.addressLine1}{' '}
                  {details.organizationAddress.addressLine2}{' '}
                  {details.organizationAddress.addressLine3}{' '}
                  {details.organizationAddress.city}{' '}
                  {details.organizationAddress.state}{' '}
                  {details.organizationAddress.postalCode}
                </div>
              </div>
              <div className="row">
                <div className="offset-4 col-md-8">
                  <a href="mailto:CEVEnquiries@gov.bc.ca?subject=ZEVA supplier address change request">Request change to name or address</a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="row mt-5">
        <div className="col-sm-6">
          <h2>Users</h2>
        </div>
        <div className="col-sm-6 text-right">
          <button
            className="button primary mb-3"
            onClick={() => {
              history.push(ROUTES_ORGANIZATIONS.MINE_ADD_USER);
            }}
            type="button"
          >
            <FontAwesomeIcon icon="user-plus" /> <span>New User</span>
          </button>
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
