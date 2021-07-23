import React from 'react';
import PropTypes from 'prop-types';
import formatNumeric from '../../app/utilities/formatNumeric';

const ComplianceObligationTableCreditsIssued = (props) => {
  const {
    reportDetails, reportYear, pendingBalanceExist,
  } = props;

  const {
    creditBalanceStart, pendingBalance, transactions, provisionalBalance,
  } = reportDetails;
  const {
    creditsIssuedSales, transfersIn, transfersOut, initiativeAgreement, purchaseAgreement, administrativeAllocation, administrativeReduction, automaticAdministrativePenalty,
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
            {title === 'Transferred Away' || title === 'Administrative Credit Reduction' ? (
              <>
                <td className={`${numberClassname} ${Number(each.A) > 0 ? 'text-red' : ''}`}>
                  {formatNumeric(each.A * -1, 2)}
                </td>
                <td className={`${numberClassname} ${Number(each.B) > 0 ? 'text-red' : ''}`}>
                  {formatNumeric(each.B * -1, 2)}
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
                {formatNumeric(creditBalanceStart[each].A, 2)}
              </td>
              <td className="text-right">
                {formatNumeric(creditBalanceStart[each].B, 2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="mt-4 mb-2">Credit Activity</h3>
      {(Object.keys(creditsIssuedSales).length > 0 || Object.keys(pendingBalance).length > 0
      || Object.keys(transfersIn).length > 0 || Object.keys(transfersOut).length > 0
      || (initiativeAgreement && Object.keys(initiativeAgreement).length > 0)
      || (purchaseAgreement && Object.keys(purchaseAgreement).length > 0)
      || (administrativeAllocation && Object.keys(administrativeAllocation).length > 0)
      || (administrativeReduction && Object.keys(administrativeReduction).length > 0)
      || (automaticAdministrativePenalty && Object.keys(automaticAdministrativePenalty).length > 0))
      && (
      <table className="mb-4">
        <tbody>
          {automaticAdministrativePenalty && Object.keys(automaticAdministrativePenalty).length > 0
            && (
              tableSection(automaticAdministrativePenalty, 'Automatic Administrative Penalty')
            )}

          {Object.keys(creditsIssuedSales).length > 0
            && (
              tableSection(creditsIssuedSales, 'Issued for Consumer ZEV Sales')
            )}
          {Object.keys(pendingBalance).length > 0
            && (
              tableSection(pendingBalance, 'Pending Issuance for Consumer ZEV Sales')
            )}

          {initiativeAgreement && Object.keys(initiativeAgreement).length > 0
            && (
              tableSection(initiativeAgreement, 'Issued from Initiative Agreements')
            )}
          {purchaseAgreement && Object.keys(purchaseAgreement).length > 0
            && (
              tableSection(purchaseAgreement, 'Issued from Purchase Agreements')
            )}
          {administrativeAllocation && Object.keys(administrativeAllocation).length > 0
            && (
              tableSection(administrativeAllocation, 'Administrative Credit Allocation')
            )}
          {Object.keys(transfersIn).length > 0
            && (
              tableSection(transfersIn, 'Transferred In')
            )}
          {administrativeReduction && Object.keys(administrativeReduction).length > 0
            && (
              tableSection(administrativeReduction, 'Administrative Credit Reduction')
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
              {pendingBalanceExist ? 'Provisional Balance Before Credit Reduction' : 'Balance Before Credit Reduction'}
            </th>
            <th className="small-column text-center text-blue">A</th>
            <th className="small-column text-center text-blue">B</th>
          </tr>
          {Object.keys(provisionalBalance).length > 0
          && Object.keys(provisionalBalance).sort((a, b) => {
            if (a.modelYear < b.modelYear) {
              return 1;
            }
            if (a.modelYear > b.modelYear) {
              return -1;
            }
            return 0;
          }).map((each) => ((provisionalBalance[each].A > 0 || provisionalBalance[each].B > 0) && (
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
          )))}
        </tbody>
      </table>
    </>
  );
};

ComplianceObligationTableCreditsIssued.defaultProps = {
  pendingBalanceExist: false,
};

ComplianceObligationTableCreditsIssued.propTypes = {
  pendingBalanceExist: PropTypes.bool,
  reportYear: PropTypes.number.isRequired,
  reportDetails: PropTypes.shape().isRequired,
};
export default ComplianceObligationTableCreditsIssued;
