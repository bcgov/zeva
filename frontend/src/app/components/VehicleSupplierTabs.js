import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

import ROUTES_ORGNIZATIONS from '../routes/Organizations';
import ROUTES_CREDITS from '../routes/Credits';

import CustomPropTypes from '../utilities/props';

const VehicleSupplierTabs = (props) => {
  const { active, user } = props;

  return (
    <ul
      className="nav nav-tabs"
      key="tabs"
      role="tablist"
    >
      <li
        className={`nav-item ${(active === 'supplier-info') ? 'active' : ''}`}
        role="presentation"
      >
        <Link to={' '}>Supplier Info</Link>
      </li>
      <li
        className={`nav-item ${(active === 'supplier-users') ? 'active' : ''}`}
        role="presentation"
      >
        <Link to={' '}>Users</Link>
      </li>
      <li
        className={`nav-item ${(active === 'supplier-zev-models') ? 'active' : ''}`}
        role="presentation"
      >
        <Link to={' '}>ZEV Models</Link>
      </li>
      <li
        className={`nav-item ${(active === 'credit-transactions') ? 'active' : ''}`}
        role="presentation"
      >
        <Link to={ROUTES_CREDITS.LIST}>Credit Transactions</Link>
      </li>
    </ul>
  );
};

VehicleSupplierTabs.propTypes = {
  active: PropTypes.string.isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default VehicleSupplierTabs;
