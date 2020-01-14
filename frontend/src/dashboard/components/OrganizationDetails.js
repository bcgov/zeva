import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import React from 'react';

const OrganizationDetails = (props) => {
  const { details } = props;

  return (
    <div id="organization-details" className="dashboard-fieldset">
      <h1>Organization Details</h1>

      <div className="content">
        <div className="text">
          {details.name}
          {details.organizationAddress && (
            <dl>
              <dd>{details.organizationAddress.addressLine1}</dd>
              <dt />
              <dd>
                <span> {details.organizationAddress.city} </span>
                <span> {details.organizationAddress.state} </span>
                <span> {details.organizationAddress.country} </span>
              </dd>
              <dt />
              <dd>{details.organizationAddress.postalCode}</dd>
            </dl>
          )}
        </div>
      </div>

      <div className="content">
        <span className="icon">
          <FontAwesomeIcon icon="cog" />
        </span>

        <div className="text">
          <button
            type="button"
          >
            Edit Address
          </button>
        </div>
      </div>

      <div className="content">
        <div className="text">
          <button
            type="button"
          >
            Users
          </button>
        </div>
      </div>

      <div className="content">
        <div className="text">
          <button
            type="button"
          >
            New user
          </button>
        </div>
      </div>

      <div className="content">
        <div className="text">
          <button
            type="button"
          >
            Create new BCeID account
          </button>
        </div>
      </div>
    </div>
  );
};

OrganizationDetails.defaultProps = {
};

OrganizationDetails.propTypes = {
  details: PropTypes.shape({
    name: PropTypes.string,
    organizationAddress: PropTypes.shape({
      addressLine1: PropTypes.string,
      city: PropTypes.string,
      country: PropTypes.string,
      postalCode: PropTypes.string,
      state: PropTypes.string,
    }),
  }).isRequired,
};

export default OrganizationDetails;
