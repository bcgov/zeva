import PropTypes from 'prop-types';
import React from 'react';

import CreditBalanceTable from './CreditBalanceTable';
import CreditTransactionListTable from './CreditTransactionListTable';

const CreditTransactions = (props) => {
  const { balances, items, user } = props;

  let totalA = 0;
  let totalB = 0;

  const transactions = items.map((item) => {
    if (item.creditClass.creditClass === 'A') {
      totalA += parseFloat(item.creditValue);
    }

    if (item.creditClass.creditClass === 'B') {
      totalB += parseFloat(item.creditValue);
    }

    const obj = {
      ...item,
      displayTotalA: totalA,
      displayTotalB: totalB,
    };

    return obj;
  });

  return (
    <div id="credit-transaction-details" className="page">
      <div className="row">
        <div className="col-sm-6">
          <h2>Detailed Credit Balance</h2>
          <CreditBalanceTable
            items={balances}
            user={user}
          />
        </div>
      </div>

      <div className="row mt-5">
        <div className="col-sm-12">
          <h3>Credit Transactions</h3>
          <CreditTransactionListTable items={transactions} />
        </div>
      </div>
    </div>
  );
};

CreditTransactions.propTypes = {
  balances: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  items: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  user: PropTypes.shape({
    organization: PropTypes.shape(),
  }).isRequired,
};

export default CreditTransactions;
