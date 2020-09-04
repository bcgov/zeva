/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';
import ROUTES_CREDITS from '../app/routes/Credits';
import CustomPropTypes from '../app/utilities/props';
import CreditTransfersListPage from './components/CreditTransfersListPage';

const CreditTransferListContainer = (props) => {
  const [creditTransfers, setCreditTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { keycloak, user } = props;

  const refreshList = (showLoading) => {
    setLoading(showLoading);

    axios.get('/credit-transfers').then((response) => {
      setCreditTransfers(response.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshList(true);
  }, [keycloak.authenticated]);

  return (
    <CreditTransfersListPage
      loading={loading}
      creditTransfers={creditTransfers}
      user={user}
    />
  );
};

CreditTransferListContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default withRouter(CreditTransferListContainer);
