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
          <p id="balance">Credit Balance:</p>
        </div>
      </div>
      <table className="transaction-table">
        <thead>
          <tr>
            <th colSpan="1" className="date-column"> </th>
            <th colSpan="1"> </th>
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
          {items.map((each) => (
            <tr key={each.id}>
              <td className="date-column">{each.transactionTimestamp.slice(0, 10)}</td>
              <td className="text-left">{each.transactionType.transactionType}</td>
              <td className="text-center">1</td>
              <td className="text-center">1</td>
              <td className="balance-a">1</td>
              <td className="balance-b">1</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default CreditTransactions;
