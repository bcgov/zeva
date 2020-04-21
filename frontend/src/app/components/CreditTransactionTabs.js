import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

import ROUTES_CREDITS from '../routes/Credits';
import ROUTES_SALES from '../routes/Sales';
import CustomPropTypes from '../utilities/props';

const CreditTransactionTabs = (props) => {
  const { active, user } = props;

  return (
    <ul
      className="nav nav-tabs"
      key="tabs"
      role="tablist"
    >
      <li
        className={`nav-item ${(active === 'credit-transactions') ? 'active' : ''}`}
        role="presentation"
      >
        <Link to={ROUTES_CREDITS.LIST}>Credit Transactions</Link>
      </li>
      <li
        className={`nav-item ${(active === 'credit-requests') ? 'active' : ''}`}
        role="presentation"
      >
        <Link to={user.isGovernment ? ROUTES_CREDITS.CREDIT_REQUESTS : ROUTES_SALES.ADD}>Credit Requests</Link>
      </li>
      <li
        className={`nav-item ${(active === 'credit-transfers') ? 'active' : ''}`}
        role="presentation"
      >
        <Link to="/">Credit Transfers</Link>
      </li>
      <li
        className={`nav-item ${(active === 'initiative-agreements') ? 'active' : ''}`}
        role="presentation"
      >
        <Link to="/">Initiative Agreements</Link>
      </li>
      <li
        className={`nav-item ${(active === 'purchase-requests') ? 'active' : ''}`}
        role="presentation"
      >
        <Link to="/">Purchase Requests</Link>
      </li>
    </ul>
  );
};

CreditTransactionTabs.propTypes = {
  active: PropTypes.string.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default CreditTransactionTabs;
