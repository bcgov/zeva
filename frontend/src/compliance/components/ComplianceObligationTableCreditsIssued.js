import React from 'react';
import PropTypes from 'prop-types';
import formatNumeric from '../../app/utilities/formatNumeric';

const ComplianceObligationTableCreditsIssued = (props) => {
  const {
    reportDetails, reportYear,
  } = props;

  const {
    creditBalanceStart, pendingBalance, transactions, provisionalBalance,
  } = reportDetails;
  const {
    creditsIssuedSales, transfersIn, transfersOut,
  } = transactions;
  const tableSection = (input, title, negativeValue) => {
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
          <th className="small-column text-center text-blue">A</th>
          <th className="small-column text-center text-blue">B</th>

        </tr>
        {input.sort((a, b) => {
          if (a.modelYear > b.modelYear) {
            return 1;
          }
          if (a.modelYear < b.modelYear) {
            return -1;
          }
          return 0;
        }).map((each) => (
          <tr key={each.modelYear}>
            <td className="text-blue">
              &bull; &nbsp; &nbsp; {each.modelYear} Credits
            </td>
            {title === 'Transferred Away' ? (
              <>
                <td className={`${numberClassname} ${Number(each.A) > 0 ? 'text-red' : ''}`}>
                 {-formatNumeric(each.A, 2)}
                </td>
                <td className={`${numberClassname} ${Number(each.B) > 0 ? 'text-red' : ''}`}>
                  {-formatNumeric(each.B, 2)}
                </td>
              </>
            ) : (
              <>
                <td className={`${numberClassname} ${Number(each.A) < 0 ? 'text-red' : ''}`}>
                  {formatNumeric(each.A, 2)}
                </td>
                <td className={`${numberClassname} ${Number(each.B) < 0 ? 'text-red' : ''}`}>
                  {formatNumeric(each.B, 2)}
                </td>
              </>
            )}
          </tr>
        ))}
      </>
    );
  };
  return (
    <>
      <table>
        <tbody>
          <tr className="subclass">
            <th className="large-column">
              CREDIT BALANCE AT END OF SEPT. 30,  {reportYear}
            </th>
            <th className="small-column text-center text-blue">
              A
            </th>
            <th className="small-column text-center text-blue">
              B
            </th>
          </tr>
          {Object.keys(creditBalanceStart).map((each) => (
            <tr key={each}>
              <td className="text-blue">
                &bull; &nbsp; &nbsp; Credits
              </td>
              <td className="text-right">
                {creditBalanceStart[each].A}
              </td>
              <td className="text-right">
                {creditBalanceStart[each].B}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="mt-4 mb-2">Credit Activity</h3>
      {(Object.keys(creditsIssuedSales).length > 0 || Object.keys(pendingBalance).length > 0
      || Object.keys(transfersIn).length > 0 || Object.keys(transfersOut).length > 0) && (
      <table className="mb-4">
        <tbody>
          {Object.keys(creditsIssuedSales).length > 0
            && (
              tableSection(creditsIssuedSales, 'Issued for Consumer ZEV Sales')
            )}
          {Object.keys(pendingBalance).length > 0
            && (
              tableSection(pendingBalance, 'Pending Issuance for Consumer ZEV Sales')
            )}
          {/* {Object.keys(creditsIssuedInitiative).length > 0
            && (
              tableSection(creditsIssuedInitiative, 'Issued from Initiative Agreements')
            )}
          {Object.keys(creditsIssuedPurchase).length > 0
            && (
              tableSection(creditsIssuedPurchase, 'Issued from Purchase Agreements')
            )} */}
          {Object.keys(transfersIn).length > 0
            && (
              tableSection(transfersIn, 'Transferred In')
            )}
          {Object.keys(transfersOut).length > 0
            && (
              tableSection(transfersOut, 'Transferred Away')
            )}
        </tbody>
      </table>
      )}

      <table>
        <tbody>
          <tr className="subclass">
            <th className="large-column">
              Provisional Balance Before Credit Reduction
            </th>
            <th className="small-column text-center text-blue">A</th>
            <th className="small-column text-center text-blue">B</th>
          </tr>
          {Object.keys(provisionalBalance).length > 0
          && (

            Object.keys(provisionalBalance).sort((a, b) => {
              if (a.modelYear < b.modelYear) {
                return 1;
              }
              if (a.modelYear > b.modelYear) {
                return -1;
              }
              return 0;
            }).map((each) => (
              <tr key={each}>
                <td className="text-blue">
                  &bull; &nbsp; &nbsp; {each} Credits
                </td>
                <td className="text-right">
                  {formatNumeric(provisionalBalance[each].A, 2)}
                </td>
                <td className="text-right">
                  {formatNumeric(provisionalBalance[each].B, 2)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </>
  );
};
ComplianceObligationTableCreditsIssued.propTypes = {
  reportYear: PropTypes.number.isRequired,
  reportDetails: PropTypes.shape().isRequired,
};
export default ComplianceObligationTableCreditsIssued;
