import React from 'react';

const ComplianceObligationTableCreditsIssued = (props) => {
  const { creditsIssuedDetails } = props;
  const {
    creditsIssuedSales, creditsIssuedInitiative, creditsIssuedPurchase,
    creditsTransferredIn, creditsTransferredAway,
  } = creditsIssuedDetails;

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
          <th className="text-center text-blue">
            {showAandB ? 'A' : ''}
          </th>
          <th className="text-center text-blue">
            {showAandB ? 'B' : ''}
          </th>
        </tr>
        {input.map((each) => (
          <tr key={each.year}>
            <td className="text-blue">
              &bull; &nbsp; &nbsp; {each.year} Credits
            </td>
            <td className={numberClassname}>
              {each.A || ''}
            </td>
            <td className={numberClassname}>
              {each.B || ''}
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
        {Object.keys(creditsIssuedInitiative).length > 0
          && (
            tableSection(creditsIssuedInitiative, 'Credits Issued from Initiative Agreements')
          )}
        {Object.keys(creditsIssuedPurchase).length > 0
          && (
            tableSection(creditsIssuedPurchase, 'Credits Issued from Purchase Agreements')
          )}
        {Object.keys(creditsTransferredIn).length > 0
          && (
            tableSection(creditsTransferredIn, 'Credits Transferred In')
          )}
        {Object.keys(creditsTransferredAway).length > 0
          && (
            tableSection(creditsTransferredAway, 'Credits Transferred Away', false, true)
          )}
      </tbody>
    </table>
  );
};
export default ComplianceObligationTableCreditsIssued;
