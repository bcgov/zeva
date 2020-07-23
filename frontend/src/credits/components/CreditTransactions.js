import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import ROUTES_CREDITS from '../../app/routes/Credits';

const CreditTransactions = (props) => {
  const { title, items, user } = props;
  let totalA = 0;
  let totalB = 0;

  items.forEach((item) => {
    const { debitFrom, creditClass } = item;
    let { creditValue } = item;

    if (debitFrom) {
      creditValue *= -1; // if it's a debit we should be subtracting from the total
    }

    if (creditClass && creditClass.creditClass === 'A') {
      totalA += parseFloat(creditValue);
    } else if (creditClass && creditClass.creditClass === 'B') {
      totalB += parseFloat(creditValue);
    }
  });

  return (
    <div id="credit-transaction-details" className="page">
      <div className="row">
        <div className="col-sm-12">
          <h1>{title}</h1>
          <h2>
            Credit Balance: {user.organization.balance.A}-A/ {user.organization.balance.B}-B
            -- <Link className="link" to={ROUTES_CREDITS.CREDIT_BALANCES}>See credit detail</Link>
          </h2>
        </div>
      </div>
      <table className="transaction-table">
        <thead>
          <tr>
            <th className="date-column"> </th>
            <th> </th>
            <th colSpan="2">Credits</th>
            <th colSpan="2" className="balance-a">Balance</th>
          </tr>
          <tr>
            <th>Date</th>
            <th>Transaction</th>
            <th>A</th>
            <th>B</th>
            <th className="balance-a">A</th>
            <th>B</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const displayTotalA = totalA;
            const displayTotalB = totalB;

            if (item.creditClass.creditClass === 'A') {
              totalA -= item.creditValue;
            }

            if (item.creditClass.creditClass === 'B') {
              totalB -= item.creditValue;
            }

            return (
              <tr key={item.id}>
                <td className="date-column">{item.transactionTimestamp.slice(0, 10)}</td>
                <td className="text-left">{item.transactionType.transactionType}</td>
                <td className="text-center">{item.creditClass.creditClass === 'A' ? item.creditValue : '-'}</td>
                <td className="text-center">{item.creditClass.creditClass === 'B' ? item.creditValue : '-'}</td>
                <td className="balance-a">{displayTotalA.toFixed(2)}</td>
                <td className="balance-b">{displayTotalB.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

CreditTransactions.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  title: PropTypes.string.isRequired,
  user: PropTypes.shape({
    organization: PropTypes.shape(),
  }).isRequired,
};

export default CreditTransactions;
