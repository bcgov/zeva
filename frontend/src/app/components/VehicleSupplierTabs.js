import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';

import ROUTES_ORGANIZATIONS from '../routes/Organizations';


const VehicleSupplierTabs = (props) => {
  const {
    active,
    supplierId,
    setActiveTab,
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
        <Link to={ROUTES_ORGANIZATIONS.DETAILS.replace(/:id/g, supplierId)} onClick={() => { setActiveTab('supplier-info'); }}>Supplier Info</Link>
      </li>
      <li
        className={`nav-item ${(active === 'supplier-users') ? 'active' : ''}`}
        role="presentation"
      >
        <Link to={ROUTES_ORGANIZATIONS.USERS.replace(/:id/g, supplierId)} onClick={() => { setActiveTab('supplier-users'); }}>Users</Link>
      </li>
      <li
        className={`nav-item ${(active === 'supplier-zev-models') ? 'active' : ''}`}
        role="presentation"
      >
        <Link to={ROUTES_ORGANIZATIONS.VEHICLES.replace(/:id/g, supplierId)} onClick={() => { setActiveTab('supplier-zev-models'); }}>ZEV Models</Link>
      </li>
      <li
        className={`nav-item ${(active === 'supplier-credit-transactions') ? 'active' : ''}`}
        role="presentation"
      >
        <Link to={ROUTES_ORGANIZATIONS.TRANSACTIONS.replace(/:id/g, supplierId)} onClick={() => { setActiveTab('supplier-credit-transactions'); }}>Credit Transactions</Link>
      </li>
    </ul>
  );
};

VehicleSupplierTabs.propTypes = {
  active: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  supplierId: PropTypes.number.isRequired,
};

export default VehicleSupplierTabs;
