import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import History from '../../app/History';
import CustomPropTypes from '../../app/utilities/props';
import ROUTES_USERS from '../../app/routes/Users';
import ROUTES_ORGANIZATIONS from '../../app/routes/Organizations';

const UserSettings = (props) => {
  const { details } = props;
  return (
    <div id="user-settings" className="dashboard-fieldset">
      <h1>Welcome</h1>

      <div className="content">
        <div className="text">
          <h5>{details.displayName}{details.title ? ', ' : ''}</h5>
          <dd>{details.title}</dd>
        </div>
      </div>

      <div className="content">
        <div className="text">
          <FontAwesomeIcon icon={['fas', 'play']} />
          <button
            type="button"
            onClick={() => {
              History.push(ROUTES_USERS.EDIT.replace(/:id/gi, details.id));
            }}
          >
            Edit Profile/Users
          </button>
        </div>
      </div>
      <div className="content">
        <div className="text">
          <h5>{details.organization.name}</h5>
          {details.organization.organizationAddress && (
            <dl>
              <dd>{details.organization.organizationAddress.addressLine1}</dd>
              <dt />
              <dd>
                <span> {details.organization.organizationAddress.city} </span>
                <span> {details.organization.organizationAddress.state} </span>
                <span> {details.organization.organizationAddress.country} </span>
              </dd>
              <dt />
              <dd>{details.organization.organizationAddress.postalCode}</dd>
            </dl>
          )}
        </div>
      </div>

      <div className="content">
        <div className="text pdf-link">
          <FontAwesomeIcon icon={['fas', 'play']} />
          <button
            type="button"
            onClick={() => {
              History.push(ROUTES_ORGANIZATIONS.EDIT.replace(/:id/gi, details.organization.id));
            }}
          > Edit Vehicle Supplier Info
          </button>
        </div>
      </div>
    </div>
  );
};

UserSettings.defaultProps = {
};

UserSettings.propTypes = {
  details: CustomPropTypes.user.isRequired,
};

export default UserSettings;
