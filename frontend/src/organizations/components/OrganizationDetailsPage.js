import React from 'react';

import UsersTable from './UsersTable';

const OrganizationDetailsPage = () => (
  <div id="organization-details" className="page">
    <div className="row">
      <div className="col-sm-12">
        <h1>Optimus Autoworks</h1>
      </div>
    </div>

    <div className="row">
      <div className="col-sm-6">
        <div className="organization-address">
          12345 Main Street
          <br />
          Victoria BC Canada
          <br />
          A1B 2C3
        </div>
      </div>

      <div className="col-sm-6">
        <div className="organization-info">
          Organization Class: B
          <br />
          2019 Compliance target: 55,000
          <br />
          Credit balance: 23,000-A / 28,000-B
        </div>
      </div>
    </div>

    <div className="row mt-5">
      <div className="col-sm-12">
        <h2>Users</h2>
      </div>
    </div>

    <div className="row">
      <div className="col-sm-12">
        <UsersTable
          items={[{
            name: 'Richard',
            roles: 'Wow',
            status: 'Status',
          }]}
        />
      </div>
    </div>
  </div>
);

OrganizationDetailsPage.defaultProps = {
};

OrganizationDetailsPage.propTypes = {
};

export default OrganizationDetailsPage;
