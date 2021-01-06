import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import History from '../../app/History';
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
        <div className="content">
          <div className="text">
            <FontAwesomeIcon icon={['fas', 'play']} />
            <button
              type="button"
              onClick={() => {
                History.push(ROUTES_ORGANIZATIONS.MINE);
              }}
            >
              Manage Government of B.C. users
            </button>
          </div>
        </div>
      )}

      {typeof user.hasPermission === 'function'
        && user.hasPermission('VIEW_ORGANIZATIONS')
        && user.isGovernment && (
        <div className="content">
          <div className="text">
            <FontAwesomeIcon icon={['fas', 'play']} />
            <button
              type="button"
              onClick={() => {
                History.push(ROUTES_ORGANIZATIONS.LIST);
              }}
            >
              Add/Edit vehicle suppliers
            </button>
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
