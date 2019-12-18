import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const OrganizationDetails = () => (
  <div id="organization-details" className="dashboard-fieldset">
    <h1>Organization Details</h1>

    <div className="content">
      <div className="text">
        Optimus Autoworks
        <dl>
          <dd>12345 Main Street</dd>
          <dt />
          <dd>Victoria BC Canada</dd>
          <dt />
          <dd>A1B 2C3</dd>
        </dl>
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

OrganizationDetails.defaultProps = {
};

OrganizationDetails.propTypes = {
};

export default OrganizationDetails;
