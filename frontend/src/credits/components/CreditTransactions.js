import PropTypes from 'prop-types';
import React from 'react';

import CreditBalanceTable from './CreditBalanceTable';
import CreditTransactionListTable from './CreditTransactionListTable';

const CreditTransactions = (props) => {
  const { balances: propsBalances, items, user } = props;

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

  const balances = {};

  propsBalances.sort((a, b) => (
    parseFloat(b.modelYear.name) - parseFloat(a.modelYear.name)
  ));

  const totalCredits = {};

  propsBalances.forEach((balance) => {
    if (balance.modelYear && balance.creditClass) {
      balances[balance.modelYear.name] = {
        ...balances[balance.modelYear.name],
        [balance.creditClass.creditClass]: parseFloat(balance.creditValue),
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
        [balance.creditClass.creditClass]: currentValue + parseFloat(balance.creditValue),
      };
    }
  });

  return (
    <div id="credit-transaction-details" className="page mb-0">
      {!user.isGovernment && (
      <div className="row mb-5">
        <div className="col-sm-5">
          <h2 className="pt-0">Detailed Credit Balance</h2>
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

      <div className="row">
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
    isGovernment: PropTypes.bool,
    organization: PropTypes.shape(),
  }).isRequired,
};

export default CreditTransactions;
