import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

import ROUTES_CREDIT_REQUESTS from '../routes/CreditRequests';
import ROUTES_CREDIT_TRANSFERS from '../routes/CreditTransfers';
import ROUTES_CREDITS from '../routes/Credits';
import CustomPropTypes from '../utilities/props';

import CONFIG from '../config';

const CreditTransactionTabs = (props) => {
  const { active, user } = props;

  return (
    <ul
      className="nav nav-tabs"
      key="tabs"
      role="tablist"
    >
      {!user.isGovernment && (
      <li
        className={`nav-item ${(active === 'credit-transactions') ? 'active' : ''}`}
        role="presentation"
      >
        <Link to={ROUTES_CREDITS.LIST}>Credit Balance</Link>
      </li>
      )}
      <li
        className={`nav-item ${(active === 'credit-requests') ? 'active' : ''}`}
        role="presentation"
      >
        <Link to={ROUTES_CREDIT_REQUESTS.LIST}>Credit Applications</Link>
      </li>
      {CONFIG.FEATURES.CREDIT_TRANSFERS.ENABLED && (
      <li
        className={`nav-item ${(active === 'credit-transfers') ? 'active' : ''}`}
        role="presentation"
      >
        <Link to={ROUTES_CREDIT_TRANSFERS.LIST}>Credit Transfers</Link>
      </li>
      )}
      {typeof user.hasPermission === 'function'&& user.hasPermission('EDIT_ICBC_DATA') && user.isGovernment &&(
      <li
        className={`nav-item ${(active === 'icbc-update') ? 'active' : ''}`}
        role="presentation"
      >
        <Link to={ROUTES_CREDITS.UPLOAD_VERIFICATION}>Update ICBC Data</Link>
      </li>
      )}
      {CONFIG.FEATURES.INITIATIVE_AGREEMENTS.ENABLED && (
      <li
        className={`nav-item ${(active === 'initiative-agreements') ? 'active' : ''}`}
        role="presentation"
      >
        <Link to="/">Initiative Agreements</Link>
      </li>
      )}
      {CONFIG.FEATURES.PURCHASE_REQUESTS.ENABLED && (
      <li
        className={`nav-item ${(active === 'purchase-requests') ? 'active' : ''}`}
        role="presentation"
      >
        <Link to="/">Purchase Requests</Link>
      </li>
      )}
    </ul>
  );
};

CreditTransactionTabs.propTypes = {
  active: PropTypes.string.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default CreditTransactionTabs;
