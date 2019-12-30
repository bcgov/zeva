import React from 'react';

import Actions from './Actions';
import Balance from './Balance';
import Feedback from './Feedback';
import OrganizationDetails from './OrganizationDetails';
import UserSettings from './UserSettings';

const DashboardPage = () => (
  <div id="dashboard">
    <div className="row">
      <div className="col-lg-3">
        <Balance />

        <Feedback />
      </div>

      <div className="col-lg-5">
        <Actions />
      </div>

      <div className="col-lg-4">
        <OrganizationDetails />

        <UserSettings />
      </div>
    </div>
  </div>
);

export default DashboardPage;
