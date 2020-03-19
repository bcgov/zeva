import React from 'react';
import ReactTable from 'react-table';

const CreditTransactions = (props) => {
  const { title, items } = props;
  console.log(items);


  return (
    <div id="credit-transaction-details" className="page">
      <div className="row">
        <div className="col-sm-12">
          <h2>{title}</h2>
          <p>Credit Balance: add later</p>
        </div>
      </div>
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Transaction</th>
            <th>Credits A</th>
            <th>Credits B</th>
            <th>Balance</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {items.map((each) => (
            <tr>
              <td>{each.transactionTimestamp}</td>
              <td>{each.transactionType.transactionType}</td>
              <td>100</td>
              <td>200</td>
              <td>100</td>
              <td>200</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default CreditTransactions;
