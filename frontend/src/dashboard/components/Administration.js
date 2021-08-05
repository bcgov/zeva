import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import ROUTES_ORGANIZATIONS from '../../app/routes/Organizations';
import CustomPropTypes from '../../app/utilities/props';

const Administration = (props) => {
  const { user } = props;

  return (
    <div id="administration" className="dashboard-fieldset">
      <h1>Administration</h1>

      {typeof user.hasPermission === 'function'
        && user.hasPermission('EDIT_USERS')
        && user.isGovernment && (
        <div className="content list">
          <div className="text">
            <FontAwesomeIcon icon={['fas', 'play']} />
            <Link to={ROUTES_ORGANIZATIONS.MINE}>Manage Government of B.C. users</Link>
          </div>
        </div>
      )}

      {typeof user.hasPermission === 'function'
        && user.hasPermission('VIEW_ORGANIZATIONS')
        && user.isGovernment && (
        <div className="content">
          <div className="text">
            <FontAwesomeIcon icon={['fas', 'play']} />
            <Link to={ROUTES_ORGANIZATIONS.LIST}>Add/Edit vehicle suppliers</Link>
          </div>
        </div>
      )}
    </div>
  );
};

Administration.propTypes = {
  user: CustomPropTypes.user.isRequired,
};

export default Administration;
