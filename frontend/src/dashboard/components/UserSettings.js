import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const UserSettings = () => (
  <div className="dashboard-fieldset user-settings">
    <h1>User Settings</h1>

    <div>
      Buzz Collins, Senior Signing Officer
    </div>

    <div>
      <div className="content">
        <button type="button">
          User profile
        </button>
      </div>
    </div>

    <div>
      <div className="value">
        6
      </div>
      <div className="content">
        <button type="button">
          Notifications
        </button>
      </div>
      <span className="icon">
        <FontAwesomeIcon icon={['far', 'bell']} />
      </span>
    </div>

    <div>
      <div className="content">
        <button type="button">
          Configure your notifications
        </button>
      </div>
    </div>

    <div>
      <div className="content">
        <a
          href="/"
          rel="noopener noreferrer"
          target="_blank"
        >
          Help
        </a>
        <a
          href="/"
          rel="noopener noreferrer"
          target="_blank"
        >
          <FontAwesomeIcon icon={['far', 'file-pdf']} />
        </a>
      </div>
    </div>
  </div>
);

UserSettings.defaultProps = {
};

UserSettings.propTypes = {
};

export default UserSettings;
