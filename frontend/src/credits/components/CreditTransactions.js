import PropTypes from 'prop-types';
import React from 'react';

import CreditBalanceTable from './CreditBalanceTable';
import CreditTransactionListTable from './CreditTransactionListTable';

const CreditTransactions = (props) => {
  const { balances: propsBalances, items, user } = props;
  let totalA = 0;
  let totalB = 0;

  const transactions = [];

  items.sort((a, b) => {
    if (a.transactionTimestamp < b.transactionTimestamp) {
      return -1;
    }

    if (a.transactionTimestamp > b.transactionTimestamp) {
      return 1;
    }

    return 0;
  });

  items.forEach((item) => {
    if (item.creditClass.creditClass === 'A') {
      totalA += parseFloat(item.totalValue);
    }

    if (item.creditClass.creditClass === 'B') {
      totalB += parseFloat(item.totalValue);
    }

    const found = transactions.findIndex(
      (transaction) => (transaction.foreignKey === item.foreignKey),
    );

    if (found >= 0) {
      transactions[found] = {
        ...transactions[found],
        creditsA: (item.creditClass.creditClass === 'A' ? item.totalValue : transactions[found].creditsA),
        creditsB: (item.creditClass.creditClass === 'B' ? item.totalValue : transactions[found].creditsB),
        displayTotalA: totalA,
        displayTotalB: totalB,
      };
    } else {
      transactions.push({
        creditsA: (item.creditClass.creditClass === 'A' ? item.totalValue : 0),
        creditsB: (item.creditClass.creditClass === 'B' ? item.totalValue : 0),
        displayTotalA: totalA,
        displayTotalB: totalB,
        foreignKey: item.foreignKey,
        transactionTimestamp: item.transactionTimestamp,
        transactionType: item.transactionType,
      });
    }
  });

  const balances = {};

  propsBalances.sort((a, b) => (
    parseFloat(b.modelYear.name) - parseFloat(a.modelYear.name)
  ));

  const totalCredits = {};

  propsBalances.forEach((balance) => {
    if (balance.modelYear && balance.creditClass) {
      balances[balance.modelYear.name] = {
        ...balances[balance.modelYear.name],
        [balance.creditClass.creditClass]: parseFloat(balance.totalValue),
      };

      let currentValue = 0;
      if (totalCredits[balance.weightClass.weightClassCode]
        && totalCredits[balance.weightClass.weightClassCode][balance.creditClass.creditClass]) {
        currentValue = parseFloat(
          totalCredits[balance.weightClass.weightClassCode][balance.creditClass.creditClass],
        );
      }

      /*
      While this looks unnecessarily complicated,
      this is needed as we'll have more weight classes in the future
      */
      totalCredits[balance.weightClass.weightClassCode] = {
        ...totalCredits[balance.weightClass.weightClassCode],
        label: `Total ${balance.weightClass.weightClassCode}`,
        [balance.creditClass.creditClass]: currentValue + parseFloat(balance.totalValue),
      };
    }
  });

  return (
    <div id="credit-transaction" className="page">
      {!user.isGovernment && (
      <div className="row my-3">
        <div className="col-sm-5">
          <h2 className="mb-2">Detailed Credit Balance</h2>
          <CreditBalanceTable
            items={
              Object.entries(balances).map(([key, value]) => ({
                label: key,
                ...value,
              })).concat(Object.values(totalCredits))
            }
            user={user}
          />
        </div>
      </div>
      )}

      <div className="row mt-5">
        <div className="col-sm-12">
          <h2 className="mb-2">Credit Transactions</h2>
          <CreditTransactionListTable items={transactions} user={user} />
        </div>
      </div>
    </div>
  );
};

CreditTransactions.propTypes = {
  balances: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  items: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  user: PropTypes.shape({
    isGovernment: PropTypes.bool,
    organization: PropTypes.shape(),
  }).isRequired,
};

export default CreditTransactions;
