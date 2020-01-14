import PropTypes from 'prop-types';
import React from 'react';

import Actions from './Actions';
import Balance from './Balance';
import Feedback from './Feedback';
import OrganizationDetails from './OrganizationDetails';
import UserSettings from './UserSettings';

const DashboardPage = (props) => {
  const { user } = props;

  return (
    <div id="dashboard">
      <div className="row">
        <div className="col-lg-3">
          <Balance organization={user.organization} />

          <Feedback />
        </div>

        <div className="col-lg-5">
          <Actions />
        </div>

        <div className="col-lg-4">
          <OrganizationDetails details={user.organization} />

          <UserSettings details={user} />
        </div>
      </div>
    </div>
  );
};

DashboardPage.propTypes = {
  user: PropTypes.shape({
    organization: PropTypes.shape(),
  }).isRequired,
};

export default DashboardPage;
