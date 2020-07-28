import PropTypes from 'prop-types';
import React from 'react';

import CustomPropTypes from '../../app/utilities/props';
import CreditBalanceTable from './CreditBalanceTable';

const CreditRequestsPage = (props) => {
  const {
    balances,
    user,
  } = props;

  return (
    <div id="credit-balances" className="page">
      <div className="row">
        <div className="col-sm-12">
          <h1>Detailed Credit Balance</h1>
          <h2>Total Credit Balance: {user.organization.balance.A}-A/ {user.organization.balance.B}-B</h2>
        </div>
      </div>
      <div className="row">
        <div className="col-md-6">
          <CreditBalanceTable
            items={balances}
            user={user}
          />
        </div>
      </div>
    </div>
  );
};

CreditRequestsPage.defaultProps = {};

CreditRequestsPage.propTypes = {
  balances: PropTypes.arrayOf(PropTypes.object).isRequired,
  user: CustomPropTypes.user.isRequired,
};

export default CreditRequestsPage;
