import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

import ROUTES_ORGANIZATIONS from '../routes/Organizations';


const VehicleSupplierTabs = (props) => {
  const {
    active,
    supplierId,
  } = props;

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
        <Link to={ROUTES_ORGANIZATIONS.DETAILS.replace(/:id/g, supplierId)}>Supplier Info</Link>
      </li>
      <li
        className={`nav-item ${(active === 'supplier-users') ? 'active' : ''}`}
        role="presentation"
      >
        <Link to={ROUTES_ORGANIZATIONS.USERS.replace(/:id/g, supplierId)}>Users</Link>
      </li>
      <li
        className={`nav-item ${(active === 'supplier-zev-models') ? 'active' : ''}`}
        role="presentation"
      >
        <Link to={ROUTES_ORGANIZATIONS.VEHICLES.replace(/:id/g, supplierId)}>ZEV Models</Link>
      </li>
      <li
        className={`nav-item ${(active === 'supplier-credit-transactions') ? 'active' : ''}`}
        role="presentation"
      >
        <Link to={ROUTES_ORGANIZATIONS.TRANSACTIONS.replace(/:id/g, supplierId)}>Credit Transactions</Link>
      </li>
    </ul>
  );
};

VehicleSupplierTabs.defaultProps = {
  supplierId: null,
};

VehicleSupplierTabs.propTypes = {
  active: PropTypes.string.isRequired,
  supplierId: PropTypes.number,
};

export default VehicleSupplierTabs;
