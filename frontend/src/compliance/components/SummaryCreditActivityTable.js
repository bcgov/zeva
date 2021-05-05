import React from 'react';
import { object } from 'prop-types';
import formatNumeric from '../../app/utilities/formatNumeric';
import SummarySupplierInfo from './SummarySupplierInfo';

const SummaryCreditActivityTable = (props) => {
  const {
    creditActivityDetails,
    consumerSalesDetails,
    complianceRatios,
    pendingBalanceExist,
  } = props;
  const { year, ldvSales, supplierClass } = consumerSalesDetails;
  const {
    creditBalanceStart,
    creditBalanceEnd,
    transactions,
    pendingBalance,
    provisionalBalanceBeforeOffset,
    provisionalBalanceAfterOffset,
    complianceOffsetNumbers,
    provisionalAssessedBalance,
  } = creditActivityDetails;
  const tableSection = (input, title, numberClassname = 'text-right') => {
    let aTotal = formatNumeric(input.A);
    let bTotal = formatNumeric(input.B);

    // if (Array.isArray(input)) {
    //   // console.log('array')
    //   // console.log('title', title, 'input ',input)
    //   aTotal = formatNumeric(input.reduce((a, v) => a + v.A, 0), 2);
    //   bTotal = formatNumeric(input.reduce((a, v) => a + v.B, 0), 2);
    // } else {
    //   // console.log('not an array')
    //   // console.log('title', title, 'input ',input)
    //   Object.keys(input).forEach((each) => {
    //     aTotal = input[each].A;
    //     bTotal = input[each].B;
    //   });
    // };
    if (aTotal == 0.00) {
      aTotal = 0;
    }
    if (bTotal == 0.00) {
      bTotal = 0;
    }
    return (
      <>
        <tr>
          <th className="large-column text-blue">
            {title}
          </th>
          <td className={`${numberClassname} a-class`}>
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
            <h3>Compliance Obligation</h3>
          </th>
        </tr>
        <tr>
          <td className="text-blue">{year} Compliance Ratio:</td>
          <td />
          <td className="text-right">
            {complianceRatios.length > 0 && complianceRatios[0].complianceRatio}
            %
          </td>
        </tr>
        {supplierClass === 'Large' && (
          <tr>
            <td className="text-blue">Large Volume Supplier Class A Ratio:</td>
            <td />
            <td className="text-right">
              {complianceRatios.length > 0 && complianceRatios[0].zevClassA}%
            </td>
          </tr>
        )}
        <tr>
          <td className="font-weight-bold text-blue">
            Compliance Ratio Credit Reduction:
          </td>
          <td />
          <td className="text-right font-weight-bold">
            {complianceRatios.length > 0
              && formatNumeric(
                ldvSales * (complianceRatios[0].complianceRatio / 100),
                2,
              )}
          </td>
        </tr>
        {supplierClass === 'Large' && (
          <tr>
            <td className="text-blue">
              &bull; &nbsp; &nbsp; ZEV Class A Debit:
            </td>
            <td />
            <td className="text-right">
              {complianceRatios.length > 0
                && supplierClass === 'Large'
                && formatNumeric(
                  ldvSales * (complianceRatios[0].zevClassA / 100),
                  2,
                )}
            </td>
          </tr>
        )}
        <tr>
          <td className="text-blue">
            &bull; &nbsp; &nbsp; Unspecified ZEV Class Debit:
          </td>
          <td />
          <td className="text-right">
            {complianceRatios.length > 0
              && formatNumeric(
                ldvSales * (complianceRatios[0].complianceRatio / 100)
                  - ldvSales * (complianceRatios[0].zevClassA / 100),
                2,
              )}
          </td>
        </tr>
      </tbody>
      <tbody>
        <tr>
          <th>
            <h3>Credit Activity</h3>
          </th>
          <th className="text-center a-class">
            <h4>A</h4>
          </th>
          <th className="text-center">
            <h4>B</h4>
          </th>
        </tr>
      </tbody>
      <tbody>
        {tableSection(
          creditBalanceStart,
          `Balance at end of September 30, ${year - 1} :`,
        )}
        {/* {tableSection(
          creditBalanceStart,
          `Balance at September 30, ${creditBalanceStart.year} :`
        )} */}
        {Object.keys(transactions.creditsIssuedSales).length > 0
          && tableSection(transactions.creditsIssuedSales, 'Consumer ZEV Sales:')}
        {Object.keys(pendingBalance).length > 0
          && tableSection(pendingBalance, 'Pending for Consumer Sales:')}
        {/* {Object.keys(creditsIssuedInitiative).length > 0
          && (
            tableSection(creditsIssuedInitiative, 'Initiative Agreements:')
          )}
        {Object.keys(creditsIssuedPurchase).length > 0
          && (
            tableSection(creditsIssuedPurchase, 'Purchase Agreements:')
          )} */}
        {Object.keys(transactions.transfersIn).length > 0
          && tableSection(transactions.transfersIn, 'Transferred In:')}
        {Object.keys(transactions.transfersOut).length > 0
          && tableSection(
            transactions.transfersOut,
            'Transferred Away:',
            'text-red text-right',
          )}

        {/* {Object.keys(provisionalAssessedBalance).length > 0
          && (
            tableSection(provisionalAssessedBalance, 'Provisional assessed balance:')
          )} */}
      </tbody>

      <tbody>
        <tr>
          <th>
            <h3>Credit Reduction:</h3>
          </th>
          {Object.keys(complianceOffsetNumbers).length > 0
          && (
            <>
              <th className="text-right a-class">
                <h4 className="text-credit-reduction">{formatNumeric(complianceOffsetNumbers.A, 2)}</h4>
              </th>
              <th className="text-right">
                <h4 className="text-credit-reduction">{formatNumeric(complianceOffsetNumbers.B, 2)}</h4>
              </th>
            </>
          )}
        </tr>
      </tbody>
      <tbody>
        {Object.keys(provisionalBalanceAfterOffset).length > 0
          && tableSection(
            provisionalBalanceAfterOffset,
            pendingBalanceExist
              ? 'Provisional Balance after Credit Reduction:'
              : 'Balance after Credit Reduction:',
          )}
      </tbody>
    </table>
  );
};
export default SummaryCreditActivityTable;
