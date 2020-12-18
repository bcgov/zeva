import PropTypes from 'prop-types';
import React from 'react';

import history from '../History';
import ROUTES_ORGANIZATIONS from '../routes/Organizations';

const VehicleSupplierTabs = (props) => {
  const {
    active,
    locationState,
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
        <button
          onClick={() => {
            history.push(ROUTES_ORGANIZATIONS.DETAILS.replace(/:id/g, supplierId), locationState);
          }}
          type="button"
        >
          Supplier Info
        </button>
      </li>
      <li
        className={`nav-item ${(active === 'supplier-users') ? 'active' : ''}`}
        role="presentation"
      >
        <button
          onClick={() => {
            history.push(ROUTES_ORGANIZATIONS.USERS.replace(/:id/g, supplierId), locationState);
          }}
          type="button"
        >
          Users
        </button>
      </li>
      <li
        className={`nav-item ${(active === 'supplier-zev-models') ? 'active' : ''}`}
        role="presentation"
      >
        <button
          onClick={() => {
            history.push(ROUTES_ORGANIZATIONS.VEHICLES.replace(/:id/g, supplierId), locationState);
          }}
          type="button"
        >
          ZEV Models
        </button>
      </li>
      <li
        className={`nav-item ${(active === 'supplier-credit-transactions') ? 'active' : ''}`}
        role="presentation"
      >
        <button
          onClick={() => {
            history.push(ROUTES_ORGANIZATIONS.TRANSACTIONS.replace(/:id/g, supplierId), locationState);
          }}
          type="button"
        >
          Credit Transactions
        </button>
      </li>
    </ul>
  );
};

VehicleSupplierTabs.defaultProps = {
  locationState: undefined,
  supplierId: null,
};

VehicleSupplierTabs.propTypes = {
  active: PropTypes.string.isRequired,
  locationState: PropTypes.arrayOf(PropTypes.shape()),
  supplierId: PropTypes.number,
};

export default VehicleSupplierTabs;
