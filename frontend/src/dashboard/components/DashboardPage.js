import React from 'react';

import Balance from './Balance';
import Feedback from './Feedback';
import OrganizationDetails from './OrganizationDetails';

const DashboardPage = () => (
  <div id="dashboard" className="row">
    <div className="col-md-3">
      <Balance />

      <Feedback />
    </div>

    <div className="col-md-5" />

    <div className="col-md-4">
      <OrganizationDetails />
    </div>
  </div>
);

export default DashboardPage;
