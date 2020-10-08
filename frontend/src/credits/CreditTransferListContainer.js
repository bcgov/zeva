/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';

import withReferenceData from '../app/utilities/with_reference_data';
import CreditTransactionTabs from '../app/components/CreditTransactionTabs';
import ROUTES_CREDIT_TRANSFERS from '../app/routes/CreditTransfers';
import CustomPropTypes from '../app/utilities/props';
import CreditTransfersListPage from './components/CreditTransfersListPage';

const qs = require('qs');

const CreditTransferListContainer = (props) => {
  const [creditTransfers, setCreditTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { location, keycloak, user } = props;
  const [filtered, setFiltered] = useState([]);
  const query = qs.parse(location.search, { ignoreQueryPrefix: true });
  const refreshList = (showLoading) => {
    setLoading(showLoading);
    const queryFilter = [];
    Object.entries(query).forEach(([key, value]) => {
      queryFilter.push({ id: key, value });
    });
    setFiltered([...filtered, ...queryFilter]);
    axios.get(ROUTES_CREDIT_TRANSFERS.LIST).then((response) => {
      setCreditTransfers(response.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    refreshList(true);
  }, [keycloak.authenticated]);

  return ([
    <CreditTransactionTabs active="credit-transfers" key="tabs" user={user} />,
    <CreditTransfersListPage
      creditTransfers={creditTransfers}
      loading={loading}
      key="list"
      user={user}
      filtered={filtered}
      setFiltered={setFiltered}
    />,
  ]);
};

CreditTransferListContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default withRouter(withReferenceData(CreditTransferListContainer)());
