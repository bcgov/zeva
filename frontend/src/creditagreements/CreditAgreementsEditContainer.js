import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import history from '../app/History';
import CreditAgreementsForm from './components/CreditAgreementsForm';
import CreditTransactionTabs from '../app/components/CreditTransactionTabs';

const CreditAgreementsEditContainer = (props) => {
  const { user } = props;
  const { id } = useParams();

  return ([
    <CreditTransactionTabs active="credit-transfers" key="tabs" user={user} />,
    <CreditAgreementsForm id={id} user={user} />,
  ]);
};

export default CreditAgreementsEditContainer;
