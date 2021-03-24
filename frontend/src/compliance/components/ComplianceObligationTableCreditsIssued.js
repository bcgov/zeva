import React from 'react';
import PropTypes from 'prop-types';

const ComplianceObligationTableCreditsIssued = (props) => {
  const { transactions } = props;

  const {
    creditsIssuedSales, transfersIn, transfersOut,
  } = transactions;
  const tableSection = (input, title, showAandB, negativeValue) => {
    let numberClassname = 'text-right';
    if (negativeValue) {
      numberClassname += ' text-red';
    }
    return (
      <>
        <tr className="subclass">
          <th className="large-column">
            {title}
          </th>
          <th className="small-column text-center text-blue">
            {showAandB ? 'A' : ''}
          </th>
          <th className="small-column text-center text-blue">
            {showAandB ? 'B' : ''}
          </th>
        </tr>
        {input.sort((a, b) => {
          if (a.modelYear < b.modelYear) {
            return 1;
          }
          if (a.modelYear > b.modelYear) {
            return -1;
          }
          return 0;
        }).map((each) => (
          <tr key={each.modelYear}>
            <td className="text-blue">
              &bull; &nbsp; &nbsp; {each.modelYear} Credits
            </td>
            <td className={numberClassname}>
              {each.A}
            </td>
            <td className={numberClassname}>
              {each.B}
            </td>
          </tr>
        ))}
      </>
    );
  };
  return (
    <table>
      <tbody>
        {Object.keys(creditsIssuedSales).length > 0
          && (
            tableSection(creditsIssuedSales, 'Credits Issued for Consumer ZEV Sales', true)
          )}
        {/* {Object.keys(creditsIssuedInitiative).length > 0
          && (
            tableSection(creditsIssuedInitiative, 'Credits Issued from Initiative Agreements')
          )}
        {Object.keys(creditsIssuedPurchase).length > 0
          && (
            tableSection(creditsIssuedPurchase, 'Credits Issued from Purchase Agreements')
          )} */}
        {Object.keys(transfersIn).length > 0
          && (
            tableSection(transfersIn, 'Credits Transferred In')
          )}
        {Object.keys(transfersOut).length > 0
          && (
            tableSection(transfersOut, 'Credits Transferred Away', false, true)
          )}
      </tbody>
    </table>
  );
};
ComplianceObligationTableCreditsIssued.propTypes = {
  transactions: PropTypes.shape({
    creditsIssuedSales: PropTypes.arrayOf(PropTypes.shape()).isRequired,
    transfersIn: PropTypes.arrayOf(PropTypes.shape()).isRequired,
    transfersOut: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  }).isRequired,
};
export default ComplianceObligationTableCreditsIssued;
