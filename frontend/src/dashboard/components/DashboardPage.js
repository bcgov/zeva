import React from 'react';
import PropTypes from 'prop-types';

import CustomPropTypes from '../../app/utilities/props';
import ActionsBceid from './ActionsBceid';
import ActionsIdir from './ActionsIdir';
import Administration from './Administration';
import Feedback from './Feedback';
import UserSettings from './UserSettings';

const DashboardPage = (props) => {
  const { user, activityCount, loading } = props;

  return (
    <div id="dashboard">
      <div className="row">
        <div className="col-xl-3 col-lg-4 col-md-12">
          <UserSettings details={user} />
          {user && !user.isGovernment && <Feedback />}
          {user &&
            user.isGovernment &&
            (user.hasPermission('EDIT_ORGANIZATIONS') ||
              user.hasPermission('EDIT_ORGANIZATION_INFORMATION')) && (
              <Administration user={user} />
            )}
        </div>

        <div className="col-xl-8 col-lg-8 col-md-12">
          {user.isGovernment && (
            <ActionsIdir
              user={user}
              activityCount={activityCount}
              loading={loading}
            />
          )}
          {!user.isGovernment &&
            (user.hasPermission('VIEW_ZEV') ||
              user.hasPermission('EDIT_SALES') ||
              user.hasPermission('VIEW_CREDIT_TRANSFERS')) && (
              <ActionsBceid
                activityCount={activityCount}
                loading={loading}
                user={user}
              />
            )}
        </div>
      </div>
    </div>
  );
};

DashboardPage.propTypes = {
  activityCount: PropTypes.shape().isRequired,
  loading: PropTypes.bool.isRequired,
  user: CustomPropTypes.user.isRequired
};

export default DashboardPage;
