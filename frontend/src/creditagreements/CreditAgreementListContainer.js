/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';

import withReferenceData from '../app/utilities/with_reference_data';
import CreditTransactionTabs from '../app/components/CreditTransactionTabs';
import ROUTES_CREDIT_AGREEMENTS from '../app/routes/CreditAgreements';
import CustomPropTypes from '../app/utilities/props';
import CreditAgreementsListPage from './components/CreditAgreementsListPage';

const qs = require('qs');

const CreditAgreementListContainer = (props) => {
  const [creditAgreements, setCreditAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const { location, keycloak, user } = props;
  const [filtered, setFiltered] = useState([]);
  const query = qs.parse(location.search, { ignoreQueryPrefix: true });

  const handleClear = () => {
    setFiltered([]);
  };

  const fakeData = [
    {
      transactionId: 'IA-12',
      transactionType: 'Initiative Agreement',
      transactionDate: '2021-03-11',
      supplier: 'TESLA',
      aCredits: 400,
      bCredits: 0, 
      status: 'draft'
    },
    {
      transactionId: 'PA-16',
      transactionType: 'Purchase Agreement',
      transactionDate: '2020-02-21',
      supplier: 'GM',
      aCredits: 100,
      bCredits: 10, 
      status: 'Recommended'
    },
    {
      transactionId: 'AR-33',
      transactionType: 'Administrative Reduction',
      transactionDate: '2019-02-19',
      supplier: 'KIA',
      aCredits: 600,
      bCredits: 190, 
      status: 'Issued'
    },
    {
      transactionId: 'AP-31',
      transactionType: 'Automatic Penalty',
      transactionDate: '2021-01-01',
      supplier: 'HYUNDAI',
      aCredits: 1400,
      bCredits: 180, 
      status: 'Issued'
    },
    {
      transactionId: 'AP-33',
      transactionType: 'Automatic Penalty',
      transactionDate: '2021-05-05',
      supplier: 'HYUNDAI',
      aCredits: 1000,
      bCredits: 490, 
      status: 'Issued'
    },    
    {
      transactionId: 'IA-17',
      transactionType: 'Initiative Agreement',
      transactionDate: '2021-04-19',
      supplier: 'VW',
      aCredits: 200,
      bCredits: 10, 
      status: 'Recommended'
    },                
  ];

  const refreshList = (showLoading) => {
    setLoading(showLoading);
    const queryFilter = [];
    Object.entries(query).forEach(([key, value]) => {
      queryFilter.push({ id: key, value });
    });
    setFiltered([...filtered, ...queryFilter]);
    
    //the below commented request to backend api needs to be opened
    //fill in some sample data for now
    //axios.get(ROUTES_CREDIT_AGREEMENTS.LIST).then((response) => {
        //setCreditAgreements(response.data);
        setCreditAgreements(fakeData);
        setLoading(false);
    //});
  };

  useEffect(() => {
    refreshList(true);
  }, [keycloak.authenticated]);

  return ([
    <CreditTransactionTabs active="credit-agreements" key="tabs" user={user} />,
    <CreditAgreementsListPage
      creditAgreements={creditAgreements}
      filtered={filtered}
      handleClear={handleClear}
      loading={loading}
      key="list"
      setFiltered={setFiltered}
      user={user}
    />,
  ]);
};

CreditAgreementListContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default withRouter(withReferenceData(CreditAgreementListContainer)());
