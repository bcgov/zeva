import React from 'react';

import CustomPropTypes from '../../app/utilities/props';

const UserSettings = (props) => {
  const { details } = props;
  return (
    <div id="user-settings" className="dashboard-fieldset">
      <h1>Welcome</h1>

      <div className="content">
        <div className="text">
          <h5>{details.displayName}</h5>
          <dd>{details.title}</dd>
        </div>
      </div>

      <div className="content">
        <div className="text">
          <h5>{details.organization.name}</h5>
          {details.organization.organizationAddress
          && details.organization.organizationAddress.map((address) => (
            address.addressType.addressType === 'Service' && (
              <dl key={address.id}>
                <dd>{address.addressLine1}</dd>
                <dt />
                <dd>
                  <span> {address.city} </span>
                  <span> {address.state} </span>
                  <span> {address.country} </span>
                </dd>
                <dt />
                <dd>{address.postalCode}</dd>
              </dl>
            )
          ))}
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
