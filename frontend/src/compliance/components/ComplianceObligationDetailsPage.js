/* eslint-disable react/no-array-index-key */
import moment from 'moment-timezone';
import React from 'react';
import PropTypes from 'prop-types';
import { now } from 'moment';
import Button from '../../app/components/Button';
import Loading from '../../app/components/Loading';
import CustomPropTypes from '../../app/utilities/props';
import ComplianceReportAlert from './ComplianceReportAlert';
import ComplianceObligationTableCreditsIssued from './ComplianceObligationTableCreditsIssued';
import ComplianceReportSignoff from './ComplianceReportSignOff';

const ComplianceObligationDetailsPage = (props) => {
  const {
    reportDetails,
    reportYear,
    loading,
    user,
    handleCheckboxClick,
    assertions,
    checkboxes,
  } = props;
  const {
    priorYearBalance, reportYearBalance, pendingBalance, transactions,
  } = reportDetails;

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

  if (loading) {
    return <Loading />;
  }

  return (
    <div id="compliance-supplier-information-details" className="page">
      <div className="row mt-3">
        <div className="col-sm-12">
          <h2>{reportYear} Model Year Report</h2>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <ComplianceReportAlert report={details.creditActivity} type="Credit Activity" />
        </div>
      </div>
      <div id="compliance-obligation-page">
        <div className="col-12">
          <h3 className="mb-3">Compliance Obligation and Credit Activity</h3>
        </div>
        <div>
          <table id="prior-year-balance">
            <tbody>
              <tr className="subclass">
                <th className="large-column">
                  Credit Balance at September 30, {priorYearBalance.year}
                </th>
                <th className="text-center text-blue">
                  A
                </th>
                <th className="text-center text-blue">
                  B
                </th>
              </tr>
              <tr>
                <td className="text-blue">
                  &bull; &nbsp; &nbsp; Total Credit Balance
                </td>
                <td className="text-right">
                  {priorYearBalance.a}
                </td>
                <td className="text-right">
                  {priorYearBalance.b}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <ComplianceObligationTableCreditsIssued transactions={reportDetails.transactions} />
        </div>
        <div className="mt-4">
          <table id="report-year-balance">
            <tbody>
              <tr className="subclass">
                <th className="large-column">
                  Credit Balance at September 30, {reportYear}
                </th>
                <th className="text-center text-blue">
                  A
                </th>
                <th className="text-center text-blue">
                  B
                </th>
              </tr>
              {Object.keys(reportYearBalance).map((each) => (
                <tr>
                  <td className="text-blue">
                    &bull; &nbsp; &nbsp; {each} Credits
                  </td>
                  <td className="text-right">
                    {reportYearBalance[each].A}
                  </td>
                  <td className="text-right">
                    {reportYearBalance[each].B}
                  </td>
                </tr>
              ))}
              <tr className="subclass">
                <th className="large-column">
                  Credits Pending for Consumer Sales
                </th>
                <th> </th>
                <th> </th>
              </tr>

              {pendingBalance.map((each) => (
                <tr key={each.year}>
                  <td className="text-blue">
                    &bull; &nbsp; &nbsp; {each.year}
                  </td>
                  <td className="text-right">
                    {each.a}
                  </td>
                  <td className="text-right">{each.b} </td>
                </tr>
              ))}
              <tr className="subclass">
                <th className="large-column">
                  Provisional Credit Balance at September 30, 2020
                </th>
                <th> </th>
                <th> </th>
              </tr>
              <tr>
                <td className="text-blue">
                  &bull; &nbsp; &nbsp; 2020 Credits
                </td>
                <td className="text-right">
                  1,192.33
                </td>
                <td className="text-right">
                  43.43
                </td>
              </tr>
              <tr>
                <td className="text-blue">
                  &bull; &nbsp; &nbsp; 2019 Credits
                </td>
                <td className="text-right">
                  567.43
                </td>
                <td className="text-right">
                  147.86
                </td>
              </tr>
              <tr>
                <td className="text-blue font-weight-bold">
                  &bull; &nbsp; &nbsp; Total Provisional Credit Balance:
                </td>
                <td className="text-right">
                  1,759.76
                </td>
                <td className="text-right">
                  191.29
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="col-12">
          <h3 className="mt-3">2020 Compliance Ratio Reduction and Credit Offset</h3>

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
                    2020 Model Year LDV Sales\Leases:
                  </td>
                  <td>
                    10,000
                  </td>
                </tr>
                <tr>
                  <td className="text-blue">
                    2020 Compliance Ratio:
                  </td>
                  <td>
                    9.5%
                  </td>
                </tr>
                <tr>
                  <td className="text-blue">
                    Large Volume Supplier Class A Ratio
                  </td>
                  <td>
                    6%
                  </td>
                </tr>
                <tr className="font-weight-bold">
                  <td className="text-blue">
                    Ratio Reduction:
                  </td>
                  <td>
                    950.00
                  </td>
                </tr>
                <tr>
                  <td className="text-blue">
                    &bull; &nbsp; &nbsp; ZEV Class A Debit:
                  </td>
                  <td>
                    600.00
                  </td>
                </tr>
                <tr>
                  <td className="text-blue">
                    &bull; &nbsp; &nbsp; Unspecified ZEV Class Debit:
                  </td>
                  <td>
                    350.00
                  </td>
                </tr>
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
                <tr>
                  <td>
                    &bull; &nbsp; &nbsp; 2020 Credits
                  </td>
                  <td>
                    <input type="number" />
                  </td>
                  <td>
                    <input type="number" />
                  </td>
                </tr>
                <tr>
                  <td>
                    &bull; &nbsp; &nbsp; 2019 Credits
                  </td>
                  <td>
                    <input type="number" />
                  </td>
                  <td>
                    <input type="number" />
                  </td>
                </tr>
                <tr className="subclass">
                  <th className="large-column">
                    <span>
                      Total Offset:
                    </span>
                    <span className="float-right mr-3"> 21</span>
                  </th>
                  <th className="text-right pr-3">758.71</th>
                  <th className="text-right pr-3">191.29</th>
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
              <Button buttonType="save" optionalClassname="button primary" action={() => {}} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

ComplianceObligationDetailsPage.defaultProps = {
};

ComplianceObligationDetailsPage.propTypes = {
  loading: PropTypes.bool.isRequired,
  user: CustomPropTypes.user.isRequired,
};
export default ComplianceObligationDetailsPage;
