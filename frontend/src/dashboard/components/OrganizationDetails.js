import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import CustomPropTypes from '../../app/utilities/props';

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
              <dd>{details.organizationAddress.addressLine2}</dd>
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
  details: CustomPropTypes.organizationDetails.isRequired,
};

export default OrganizationDetails;
