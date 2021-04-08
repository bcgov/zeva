/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import { now } from 'moment';
import Button from '../../app/components/Button';
import Loading from '../../app/components/Loading';
import CustomPropTypes from '../../app/utilities/props';
import ComplianceReportAlert from './ComplianceReportAlert';
import ComplianceObligationTableCreditsIssued from './ComplianceObligationTableCreditsIssued';
import ComplianceReportSignoff from './ComplianceReportSignOff';
import formatNumeric from '../../app/utilities/formatNumeric';

const ComplianceObligationDetailsPage = (props) => {
  const {
    offsetNumbers,
    supplierClassInfo,
    reportDetails,
    ratios,
    reportYear,
    loading,
    user,
    handleCheckboxClick,
    assertions,
    checkboxes,
    handleOffsetChange,
    handleSave,
  } = props;

  if (loading) {
    return <Loading />;
  }
  const {
    creditBalanceStart, creditBalanceEnd, pendingBalance, transactions, provisionalBalance,
  } = reportDetails;
  const totalReduction = formatNumeric(
    ((ratios.complianceRatio / 100) * supplierClassInfo.ldvSales),
    2,
  );
  const classAReduction = formatNumeric(
    ((ratios.zevClassA / 100) * supplierClassInfo.ldvSales),
    2,
  );
  const leftoverReduction = formatNumeric(((
    ratios.complianceRatio / 100) * supplierClassInfo.ldvSales)
    - ((ratios.zevClassA / 100) * supplierClassInfo.ldvSales),
  2);
  const details = {
    creditActivity: {
      history: [{
        status: 'DRAFT',
        createTimestamp: now(),
        createUser: user,
      }],
      status: 'DRAFT',
    },
    organization: user.organization,
  };

  return (
    <div id="compliance-supplier-information-details" className="page">
      <div className="row mt-3">
        <div className="col-sm-12">
          <h2>{reportYear} Model Year Report</h2>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          {/* <ComplianceReportAlert report={details.creditActivity} type="Credit Activity" /> */}
        </div>
      </div>
      <div id="compliance-obligation-page">
        <div className="col-12">
          <h3 className="mb-2">Compliance Obligation and Credit Activity</h3>
        </div>
        <div>
          <table id="prior-year-balance">
            <tbody>
              <tr className="subclass">
                <th className="large-column">
                  Credit Balance at September 30, {reportYear - 1}
                </th>
                <th className="small-column text-center text-blue">
                  A
                </th>
                <th className="small-column text-center text-blue">
                  B
                </th>
              </tr>
              {Object.keys(creditBalanceStart).map((each) => (
                <tr>
                  <td className="text-blue">
                    &bull; &nbsp; &nbsp; Total Credit Balance
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
        </div>
        <div className="mt-4">
          <ComplianceObligationTableCreditsIssued transactions={transactions} />
        </div>
        <div className="mt-4">
          <table id="report-year-balance">
            <tbody>
              <tr className="subclass">
                <th className="large-column">
                  Credit Balance at September 30, {reportYear}
                </th>
                <th className="small-column text-center text-blue">
                  A
                </th>
                <th className="small-column text-center text-blue">
                  B
                </th>
              </tr>
              {Object.keys(creditBalanceEnd).sort((a, b) => {
                if (a < b) {
                  return 1;
                }
                if (a > b) {
                  return -1;
                }
                return 0;
              }).map((each) => (
                <tr key={each}>
                  <td className="text-blue">
                    &bull; &nbsp; &nbsp; {each} Credits
                  </td>
                  <td className="text-right">
                    {creditBalanceEnd[each].A}
                  </td>
                  <td className="text-right">
                    {creditBalanceEnd[each].B}
                  </td>
                </tr>
              ))}
              {Object.keys(pendingBalance).length > 0
              && (
              <>
                <tr className="subclass">
                  <th className="large-column">
                    Credits Pending for Consumer Sales
                  </th>
                  <th className="small-column"> </th>
                  <th className="small-column"> </th>
                </tr>
                {Object.keys(pendingBalance).sort((a, b) => {
                  if (a < b) {
                    return 1;
                  }
                  if (a > b) {
                    return -1;
                  }
                  return 0;
                }).map((each) => (
                  <tr key={each}>
                    <td className="text-blue">
                      &bull; &nbsp; &nbsp; {each} Credits
                    </td>
                    <td className="text-right">
                      {pendingBalance[each].A}
                    </td>
                    <td className="text-right">{pendingBalance[each].B} </td>
                  </tr>
                ))}
              </>
              )}
              <tr className="subclass">
                <th className="large-column">
                  Provisional Credit Balance at September 30, {reportYear}
                </th>
                <th className="small-column"> </th>
                <th className="small-column"> </th>
              </tr>
              {Object.keys(provisionalBalance).sort((a, b) => {
                if (a < b) {
                  return 1;
                }
                if (a > b) {
                  return -1;
                }
                return 0;
              }).map((each) => (
                <tr key={each}>
                  <td className="text-blue">
                    &bull; &nbsp; &nbsp; {each} Credits
                  </td>
                  <td className="text-right">
                    {provisionalBalance[each].A}
                  </td>
                  <td className="text-right">{provisionalBalance[each].B} </td>
                </tr>
              ))}
              <tr>
                <td className="text-blue font-weight-bold">
                  &bull; &nbsp; &nbsp; Total Provisional Credit Balance:
                </td>
                <td className="text-right">
                  {formatNumeric(Object.keys(provisionalBalance).reduce((a, v) => a + provisionalBalance[v].A, 0), 2)}
                </td>
                <td className="text-right">
                  {formatNumeric(Object.keys(provisionalBalance).reduce((a, v) => a + provisionalBalance[v].B, 0), 2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="col-12">
          <h3 className="mt-4 mb-2">{reportYear} Compliance Ratio Reduction and Credit Offset</h3>

          <div className="row">
            <table className="col-lg-5 col-sm-12 mr-3">
              <tbody>
                <tr className="subclass">
                  <th colSpan="2" className="text-blue">
                    Ratio Reduction
                  </th>
                </tr>
                <tr>
                  <td className="text-blue">
                    {reportYear} Model Year LDV Sales\Leases:
                  </td>
                  <td>
                    {supplierClassInfo.ldvSales}
                  </td>
                </tr>
                <tr>
                  <td className="text-blue">
                    {reportYear} Compliance Ratio:
                  </td>
                  <td>
                    {ratios.complianceRatio}%
                  </td>
                </tr>
                {supplierClassInfo.class === 'L' && (
                <tr>
                  <td className="text-blue">
                    Large Volume Supplier Class A Ratio
                  </td>
                  <td>
                    {ratios.zevClassA}%
                  </td>
                </tr>
                )}
                <tr className="font-weight-bold">
                  <td className="text-blue">
                    Ratio Reduction:
                  </td>
                  <td>
                    {totalReduction}
                  </td>
                </tr>
                {supplierClassInfo.class === 'L' && (
                  <>
                    <tr>
                      <td className="text-blue">
                        &bull; &nbsp; &nbsp; ZEV Class A Debit:
                      </td>
                      <td>
                        {classAReduction}
                      </td>
                    </tr>

                    <tr>
                      <td className="text-blue">
                        &bull; &nbsp; &nbsp; Unspecified ZEV Class Debit:
                      </td>
                      <td>
                        {leftoverReduction}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
            <table className="col-lg-6 col-sm-12" id="offset-table">
              <tbody>
                <tr className="subclass">
                  <th className="large-column">
                    Credit Offset
                  </th>
                  <th className="text-center">
                    A
                  </th>
                  <th className="text-center">
                    B
                  </th>
                </tr>
                {offsetNumbers && Object.keys(offsetNumbers).map((year) => (
                  <tr key={year}>
                    <td>
                      &bull; &nbsp; &nbsp; {year} Credits
                    </td>
                    <td>
                      <input
                        name="A"
                        id={`${year}-A`}
                        onChange={(event) => { handleOffsetChange(event); }}
                        type="number"
                      />
                    </td>
                    <td>
                      <input
                        name="B"
                        id={`${year}-B`}
                        onChange={(event) => { handleOffsetChange(event); }}
                        type="number"
                      />
                    </td>
                  </tr>
                ))}
                <tr className="subclass">
                  <th className="large-column">
                    <span>
                      Total Offset:
                    </span>
                    <span className="float-right mr-3">{formatNumeric(Object.keys(offsetNumbers).reduce((a, v) => a + offsetNumbers[v].A + offsetNumbers[v].B, 0), 2)}</span>
                  </th>
                  <th className="text-right pr-3">{formatNumeric(Object.keys(offsetNumbers).reduce((a, v) => a + offsetNumbers[v].A, 0), 2)}</th>
                  <th className="text-right pr-3">{formatNumeric(Object.keys(offsetNumbers).reduce((a, v) => a + offsetNumbers[v].B, 0), 2)}</th>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ComplianceReportSignoff
        assertions={assertions}
        handleCheckboxClick={handleCheckboxClick}
        user={user}
        checkboxes={checkboxes}
      />
      <div className="row">
        <div className="col-sm-12">
          <div className="action-bar mt-0">
            <span className="left-content">
              {/* <Button buttonType="back" locationRoute="/compliance/reports" /> */}
            </span>
            <span className="right-content">
              <Button buttonType="save" optionalClassname="button primary" action={() => { handleSave(); }} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

ComplianceObligationDetailsPage.defaultProps = {
  ratios: {
    complianceRatio: 0,
    zevClassA: 0,
  },
};

ComplianceObligationDetailsPage.propTypes = {
  loading: PropTypes.bool.isRequired,
  user: CustomPropTypes.user.isRequired,
  supplierClassInfo: PropTypes.shape().isRequired,
  reportDetails: PropTypes.shape().isRequired,
  ratios: PropTypes.shape(),
  reportYear: PropTypes.string.isRequired,
  handleCheckboxClick: PropTypes.func.isRequired,
  assertions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  checkboxes: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  ).isRequired,
};
export default ComplianceObligationDetailsPage;
