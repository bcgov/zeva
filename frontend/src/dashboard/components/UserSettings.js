import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import CustomPropTypes from '../../app/utilities/props';

const UserSettings = (props) => {
  const { details } = props;
  return (
    <div id="user-settings" className="dashboard-fieldset">
      <h1>User Settings</h1>

      <div className="content">
        <div className="text">
          {details.displayName}, Senior Signing Officer
        </div>
      </div>

      <div className="content">
        <div className="text">
          <button type="button">
            User profile
          </button>
        </div>
      </div>

      <div className="content">
        <div className="value">
          6
        </div>

        <div className="text">
          <button type="button">
            Notifications
          </button>
        </div>
        <span className="icon">
          <FontAwesomeIcon icon={['far', 'bell']} />
        </span>
      </div>

      <div className="content">
        <div className="text">
          <button type="button">
            Configure your notifications
          </button>
        </div>
      </div>

      <div className="content">
        <div className="text pdf-link">
          <a
            href="/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Help
            <FontAwesomeIcon icon={['far', 'file-pdf']} />
          </a>
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
