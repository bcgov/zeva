import React from 'react';
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
        <div className="col-lg-3">
          <UserSettings details={user} />
          {user && !user.isGovernment && (
            <Feedback />
          )}
          {user && user.isGovernment && (user.hasPermission('EDIT_ORGANIZATIONS') || user.hasPermission('EDIT_ORGANIZATION_INFORMATION'))
            && (
            <Administration user={user} />
            )}
        </div>

        <div className="col-xl-7 col-lg-9">
          {user.isGovernment ? <ActionsIdir user={user} activityCount={activityCount} loading={loading} /> : <ActionsBceid activityCount={activityCount} loading={loading} />}
        </div>
      </div>
    </div>
  );
};

DashboardPage.propTypes = {
  user: CustomPropTypes.user.isRequired,
};

export default DashboardPage;
