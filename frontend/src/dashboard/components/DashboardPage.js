import React from 'react';
import CustomPropTypes from '../../app/utilities/props';

import Actions from './Actions';
import Administration from './Administration';
import Feedback from './Feedback';
import UserSettings from './UserSettings';

const DashboardPage = (props) => {
  const { user } = props;
  return (
    <div id="dashboard">
      <div className="row">
        <div className="col-lg-3">
          <UserSettings details={user} />
          {user && !user.isGovernment && (
            <Feedback />
          )}
          {user && user.isGovernment && (
            <Administration user={user} />
          )}
        </div>

        <div className="col-lg-9">
          <Actions details={user} />
        </div>
      </div>
    </div>
  );
};

DashboardPage.propTypes = {
  user: CustomPropTypes.user.isRequired,
};

export default DashboardPage;
