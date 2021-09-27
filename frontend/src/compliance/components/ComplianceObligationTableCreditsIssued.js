import React from 'react';
import PropTypes from 'prop-types';
import formatNumeric from '../../app/utilities/formatNumeric';

const ComplianceObligationTableCreditsIssued = (props) => {
  const {
    handleSupplementalChange,
    newBalances,
    newData,
    reportDetails,
    reportYear,
    pendingBalanceExist,
    readOnly,
    supplementalReport,
  } = props;

  const {
    creditBalanceStart,
    pendingBalance,
    provisionalBalance,
    transactions,
  } = reportDetails;

  const {
    administrativeAllocation,
    administrativeReduction,
    automaticAdministrativePenalty: tempAutomaticAdministrativePenalty,
    creditsIssuedSales,
    initiativeAgreement,
    purchaseAgreement,
    transfersIn,
    transfersOut,
  } = transactions;

  const getNewData = (category, modelYear, value) => {
    if (newData && newData.creditActivity) {
      const found = newData.creditActivity.find((each) => (
        each.category === category && Number(each.modelYear) === Number(modelYear)
      ));

      if (found) {
        return found[value];
      }
    }

    return '';
  };

  const tableSection = (input, title, negativeValue) => {
    let numberClassname = 'text-right';

    if (negativeValue) {
      numberClassname += ' text-red';
    }

    let category = '';

    switch (title) {
      case 'Administrative Credit Allocation':
        category = 'administrativeAllocation';
        break;
      case 'Administrative Credit Reduction':
        category = 'administrativeReduction';
        break;
      case 'Automatic Administrative Penalty':
        category = 'automaticAdministrativePenalty';
        break;
      case 'Issued for Consumer ZEV Sales':
        category = 'creditsIssuedSales';
        break;
      case 'Issued from Initiative Agreements':
        category = 'initiativeAgreement';
        break;
      case 'Issued from Purchase Agreements':
        category = 'purchaseAgreement';
        break;
      case 'Pending Issuance for Consumer ZEV Sales':
        category = 'pendingBalance';
        break;
      case 'Transferred Away':
        category = 'transfersOut';
        break;
      case 'Transferred In':
        category = 'transfersIn';
        break;
      default:
        category = title;
    }

    return (
      <>
        <tr className="subclass">
          <th className="large-column">
            {title}
          </th>
          <th className="small-column text-center text-blue">A</th>
          <th className="small-column text-center text-blue">B</th>
          {supplementalReport && (
            <>
              <th className="small-column text-center text-blue">A</th>
              <th className="small-column text-center text-blue">B</th>
            </>
          )}
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
              &bull; &nbsp; &nbsp;
              {title !== 'Automatic Administrative Penalty' && (` ${each.modelYear} `)}
              Credits
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
            {supplementalReport && (
              <>
                <td>
                  <input
                    className="form-control"
                    defaultValue={getNewData(category, each.modelYear, 'creditAValue')}
                    type="text"
                    onChange={(event) => {
                      handleSupplementalChange({
                        title: category,
                        modelYear: each.modelYear,
                        creditA: event.target.value,
                      });
                    }}
                    readOnly={readOnly}
                  />
                </td>
                <td>
                  <input
                    className="form-control"
                    defaultValue={getNewData(category, each.modelYear, 'creditBValue')}
                    type="text"
                    onChange={(event) => {
                      handleSupplementalChange({
                        title: category,
                        modelYear: each.modelYear,
                        creditB: event.target.value,
                      });
                    }}
                    readOnly={readOnly}
                  />
                </td>
              </>
            )}
          </tr>
        ))}
      </>
    );
  };

  const automaticAdministrativePenalty = [];

  if (tempAutomaticAdministrativePenalty && tempAutomaticAdministrativePenalty.length > 0) {
    automaticAdministrativePenalty.push(tempAutomaticAdministrativePenalty.reduce(
      (aggregated, each) => ({
        modelYear: reportYear,
        A: Number(aggregated.A) + Number(each.A),
        B: Number(aggregated.B) + Number(each.B),
      }),
    ));
  }

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
            {supplementalReport && (
              <>
                <th className="small-column text-center text-blue">A</th>
                <th className="small-column text-center text-blue">B</th>
              </>
            )}
          </tr>
          {Object.keys(creditBalanceStart).map((each) => (
            <tr key={each}>
              <td className="text-blue">
                &bull; &nbsp; &nbsp; {each} Credits
              </td>
              <td className="text-right">
                {formatNumeric(creditBalanceStart[each].A, 2)}
              </td>
              <td className="text-right">
                {formatNumeric(creditBalanceStart[each].B, 2)}
              </td>
              {supplementalReport && (
                <>
                  <td>
                    <input
                      className="form-control"
                      defaultValue={getNewData('creditBalanceStart', each, 'creditAValue')}
                      type="text"
                      onChange={(event) => {
                        handleSupplementalChange({
                          title: 'creditBalanceStart',
                          modelYear: each,
                          creditA: event.target.value,
                        });
                      }}
                      readOnly={readOnly}
                    />
                  </td>
                  <td>
                    <input
                      className="form-control"
                      defaultValue={getNewData('creditBalanceStart', each, 'creditBValue')}
                      type="text"
                      onChange={(event) => {
                        handleSupplementalChange({
                          title: 'creditBalanceStart',
                          modelYear: each,
                          creditB: event.target.value,
                        });
                      }}
                      readOnly={readOnly}
                    />
                  </td>
                </>
              )}
            </tr>
          ))}
          {Object.keys(creditBalanceStart).length === 0 && (
            <tr>
              <td className="text-blue">
                &bull; &nbsp; &nbsp; Credits
              </td>
              <td className="text-right">
                0.00
              </td>
              <td className="text-right">
                0.00
              </td>
              {supplementalReport && (
                <>
                  <td>
                    <input
                      className="form-control"
                      defaultValue={getNewData('creditBalanceStart', reportYear, 'creditAValue')}
                      type="text"
                      onChange={(event) => {
                        handleSupplementalChange({
                          title: 'creditBalanceStart',
                          modelYear: reportYear,
                          creditA: event.target.value,
                        });
                      }}
                      readOnly={readOnly}
                    />
                  </td>
                  <td>
                    <input
                      className="form-control"
                      defaultValue={getNewData('creditBalanceStart', reportYear, 'creditBValue')}
                      type="text"
                      onChange={(event) => {
                        handleSupplementalChange({
                          title: 'creditBalanceStart',
                          modelYear: reportYear,
                          creditB: event.target.value,
                        });
                      }}
                      readOnly={readOnly}
                    />
                  </td>
                </>
              )}
            </tr>
          )}
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
            && tableSection(automaticAdministrativePenalty, 'Automatic Administrative Penalty')}

          {Object.keys(creditsIssuedSales).length > 0
            && tableSection(creditsIssuedSales, 'Issued for Consumer ZEV Sales')}

          {Object.keys(pendingBalance).length > 0
            && tableSection(pendingBalance, 'Pending Issuance for Consumer ZEV Sales')}

          {initiativeAgreement && Object.keys(initiativeAgreement).length > 0
            && tableSection(initiativeAgreement, 'Issued from Initiative Agreements')}

          {purchaseAgreement && Object.keys(purchaseAgreement).length > 0
            && tableSection(purchaseAgreement, 'Issued from Purchase Agreements')}

          {administrativeAllocation && Object.keys(administrativeAllocation).length > 0
            && tableSection(administrativeAllocation, 'Administrative Credit Allocation')}

          {Object.keys(transfersIn).length > 0
            && tableSection(transfersIn, 'Transferred In')}

          {administrativeReduction && Object.keys(administrativeReduction).length > 0
            && tableSection(administrativeReduction, 'Administrative Credit Reduction')}

          {Object.keys(transfersOut).length > 0
            && tableSection(transfersOut, 'Transferred Away')}
        </tbody>
      </table>
      )}

      <table>
        <tbody>
          <tr className="subclass">
            <th className="large-column">
              {pendingBalanceExist ? 'PROVISIONAL BALANCE BEFORE CREDIT REDUCTION' : 'BALANCE BEFORE CREDIT REDUCTION'}
            </th>
            <th className="small-column text-center text-blue">A</th>
            <th className="small-column text-center text-blue">B</th>
            {supplementalReport && (
              <>
                <th className="small-column text-center text-blue">A</th>
                <th className="small-column text-center text-blue">B</th>
              </>
            )}
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
          }).map((each) => ((
            provisionalBalance[each].A > 0 || provisionalBalance[each].B > 0
            || (newBalances && newBalances[each] && newBalances[each].A > 0)
            || (newBalances && newBalances[each] && newBalances[each].B > 0)
          ) && (
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
              {supplementalReport && (
                <>
                  <td className="text-right">
                    {newBalances && newBalances[each] && formatNumeric(newBalances[each].A, 2)}
                  </td>
                  <td className="text-right">
                    {newBalances && newBalances[each] && formatNumeric(newBalances[each].B, 2)}
                  </td>
                </>
              )}
            </tr>
          )))}
        </tbody>
      </table>
    </>
  );
};

ComplianceObligationTableCreditsIssued.defaultProps = {
  handleSupplementalChange: () => {},
  newBalances: {},
  newData: {},
  pendingBalanceExist: false,
  readOnly: false,
  supplementalReport: false,
};

ComplianceObligationTableCreditsIssued.propTypes = {
  handleSupplementalChange: PropTypes.func,
  newBalances: PropTypes.shape(),
  newData: PropTypes.shape(),
  pendingBalanceExist: PropTypes.bool,
  readOnly: PropTypes.bool,
  reportDetails: PropTypes.shape().isRequired,
  reportYear: PropTypes.number.isRequired,
  supplementalReport: PropTypes.bool,
};
export default ComplianceObligationTableCreditsIssued;
