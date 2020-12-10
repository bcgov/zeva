/*
 * Container component
 * All data handling & manipulation should be handled here.
 */

import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { withRouter } from 'react-router';

import ROUTES_ORGANIZATIONS from '../app/routes/Organizations';
import CustomPropTypes from '../app/utilities/props';
import VehicleSupplierTabs from '../app/components/VehicleSupplierTabs';
import VehicleSupplierUserListPage from './components/VehicleSupplierUserListPage';

const VehicleSupplierUserListContainer = (props) => {
  const { id } = useParams();
  const [details, setDetails] = useState({});
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const { keycloak, location, user} = props;
  const { state: locationState } = location;

  const refreshDetails = () => {
    setLoading(true);

    const detailsPromise = axios.get(ROUTES_ORGANIZATIONS.DETAILS.replace(/:id/gi, id)).then((response) => {
      setDetails(response.data);
    });

    const usersPromise = axios.get(ROUTES_ORGANIZATIONS.USERS.replace(/:id/gi, id)).then((response) => {
      const { users: organizationUsers } = response.data;
      setUsers(organizationUsers);
    });

    Promise.all([detailsPromise, usersPromise]).then(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshDetails();
  }, [keycloak.authenticated]);

  return (
    <div className="page">
      <h1 className="mb-2">{details.name}</h1>
      <VehicleSupplierTabs locationState={locationState} supplierId={details.id} active="supplier-users" />
      <VehicleSupplierUserListPage
        filtered={filtered}
        loading={loading}
        locationState={locationState}
        members={users}
        user={user}
        setFiltered={setFiltered}
      />
    </div>
  );
};
VehicleSupplierUserListContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  location: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired
};

export default withRouter(VehicleSupplierUserListContainer);
