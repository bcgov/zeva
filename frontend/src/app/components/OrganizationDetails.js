import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import { hot } from 'react-hot-loader';
import PropTypes from 'prop-types';
import axios from 'axios';

import NotificationsClient from '../NotificationsClient';

const OrganizationDetails = (props) => {
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  const typeName = (type) => {
    switch (type) {
      default:
        return 'Unknown';
    }
  };

  const { keycloak } = props;

  const refreshDetails = () => {
    console.error(keycloak);
    // keycloak.updateToken(30).then(() => {
    //   const client = new OrganizationDetailsClient('http://localhost:10000/grpc');

    //   const request = new GetMyOrganizationRequest();

    //   console.log(keycloak.token);

    //   const md = {
    //     authorization: keycloak.idToken, // || token for auth token
    //   };

    //   const call = client.getMyOrganization(request, md);

    //   call.on('data', (s) => {
    //     setDetails(
    //       {
    //         name: s.getName(),
    //         type: typeName(s.getType()),
    //       },
    //     );
    //     setLoading(false);
    //   });

    //   call.on('status', (s) => {
    //     console.log(s);
    //   });

    //   call.on('error', (r) => {
    //     console.error(r);
    //   });

    //   call.on('end', () => {
    //     console.log('update complete');
    //   });
    // }).catch(() => {
    //   console.error('error refreshing token');
    // });
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);

  return (
    <>
      <h1>My Organization</h1>
      {loading
      || (
      <div>
        <h2>
        Name:
          {details.name}
        </h2>
        <h2>
        Type:
          {details.type}
        </h2>
      </div>
      )}

      <NotificationsClient keycloak={keycloak} />
    </>
  );
};

OrganizationDetails.propTypes = {
  keycloak: PropTypes.shape().isRequired,
};

export default hot(module)(withRouter(OrganizationDetails));
