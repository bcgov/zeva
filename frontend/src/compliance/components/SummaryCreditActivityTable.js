import React from 'react';
import formatNumeric from '../../app/utilities/formatNumeric';

const SummaryCreditActivityTable = (props) => {
  const { creditsIssuedDetails } = props;
  const {
    startingBalance, endingBalance,
    creditsIssuedSales, creditsIssuedInitiative, creditsIssuedPurchase,
    creditsTransferredIn, creditsTransferredAway, pendingSales, provisionalBalance,
  } = creditsIssuedDetails;

  const tableSection = (input, title) => {
    const numberClassname = 'text-right';
    let aTotal;
    let bTotal;

    if (Array.isArray(input)) {
      aTotal = formatNumeric(input.reduce((a, v) => a + v.A, 0), 2);
      bTotal = formatNumeric(input.reduce((a, v) => a + v.B, 0), 2);
    } else {
      aTotal = input.A;
      bTotal = input.B;
    }
    return (
      <>
        <tr className="subclass">
          <th className="large-column text-blue">
            {title}
          </th>
          <td className={numberClassname}>
            {aTotal || 0}
          </td>
          <td className={numberClassname}>
            {bTotal || 0}
          </td>
        </tr>
      </>
    );
  };
  return (
    <table id="summary-credit-activity">
      <tbody>
        <tr>
          <th>
            <h3>Credit Activity</h3>
          </th>
          <th>
            <h4>
              A
            </h4>
          </th>
          <th>
            <h4>
              B
            </h4>
          </th>
        </tr>
      </tbody>
      <tbody>

        {tableSection(startingBalance, 'Balance at September 30, 2019:')}
        {Object.keys(creditsIssuedSales).length > 0
          && (
            tableSection(creditsIssuedSales, 'Consumer ZEV Sales:')
          )}
        {Object.keys(creditsIssuedInitiative).length > 0
          && (
            tableSection(creditsIssuedInitiative, 'Initiative Agreements:')
          )}
        {Object.keys(creditsIssuedPurchase).length > 0
          && (
            tableSection(creditsIssuedPurchase, 'Purchase Agreements:')
          )}
        {Object.keys(creditsTransferredIn).length > 0
          && (
            tableSection(creditsTransferredIn, 'Transferred In:')
          )}
        {Object.keys(creditsTransferredAway).length > 0
          && (
            tableSection(creditsTransferredAway, 'Transferred Away:')
          )}
        {tableSection(endingBalance, 'Balance at September 30, 2020:')}
        {Object.keys(pendingSales).length > 0
          && (
            tableSection(pendingSales, 'Pending for Consumer Sales:')
          )}
        {Object.keys(provisionalBalance).length > 0
          && (
            tableSection(provisionalBalance, 'Provisional Credit Balance:')
          )}
      </tbody>
    </table>
  );
};
export default SummaryCreditActivityTable;
