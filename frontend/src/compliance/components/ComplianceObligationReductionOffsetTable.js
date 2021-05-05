import React from 'react';
import PropTypes from 'prop-types';

import CustomPropTypes from '../../app/utilities/props';

const ComplianceObligationReductionOffsetTable = (props) => {
  const {
    unspecifiedCreditReduction,
    supplierClassInfo,
    zevClassAReduction,
    unspecifiedReductions,
    leftoverReduction,
    reportYear,
    creditBalance,
    totalReduction,
    user,
    statuses,
  } = props;

  return (
    <>
      <div className="col-12">
        <div className="row">
          <table className="col-12">
            <tbody>
              {supplierClassInfo.class === 'L' && (
                <>
                  <tr className="subclass">
                    <th className="large-column">ZEV Class A Credit Reduction</th>
                    <th className="small-column text-center text-blue">A</th>
                    <th className="small-column text-center text-blue">B</th>
                  </tr>
                  <tr>
                    <td className="text-blue">
                      &bull; &nbsp; &nbsp; {reportYear} Credits
                    </td>
                    <td className="text-center text-red">
                      {zevClassAReduction.currentYearA
                        ? -zevClassAReduction.currentYearA
                        : 0}
                    </td>
                    <td className="text-center">0</td>
                  </tr>
                  <tr>
                    <td className="text-blue">
                      &bull; &nbsp; &nbsp; {reportYear - 1} Credits
                    </td>
                    <td className="text-center text-red">
                      {zevClassAReduction.lastYearA
                        ? -zevClassAReduction.lastYearA
                        : 0}
                    </td>
                    <td className="text-center">0</td>
                  </tr>
                  <tr className="subclass">
                    <th className="large-column">
                      Unspecified ZEV Class Credit Reduction
                    </th>
                    <th className="text-center">A</th>
                    <th className="text-center">B</th>
                  </tr>
                </>
              )}
              {supplierClassInfo.class !== 'L' && (
                <tr className="subclass">
                  <th className="large-column">
                    Compliance Ratio Credit Reduction
                  </th>
                  <th className="text-center">A</th>
                  <th className="text-center">B</th>
                </tr>
              )}
              <tr>
                <td>
                  Do you want to use ZEV Class A or B credits first for your
                  unspecified ZEV class reduction?
                </td>
                <td className="text-center">
                  <input
                    disabled={user.isGovernment || statuses.complianceObligation.status === 'SUBMITTED' || statuses.complianceObligation.status === 'CONFIRMED'}
                    type="radio"
                    id="A"
                    onChange={(event) => {
                      unspecifiedCreditReduction(
                        event,
                        supplierClassInfo.class === 'L'
                          ? leftoverReduction
                          : totalReduction,
                      );
                    }}
                    name="creditOption"
                    value="A"
                  />
                </td>
                <td className="text-center">
                  <input
                    disabled={user.isGovernment || statuses.complianceObligation.status === 'SUBMITTED' || statuses.complianceObligation.status === 'CONFIRMED'}
                    className="text-center"
                    type="radio"
                    id="B"
                    onChange={(event) => {
                      unspecifiedCreditReduction(
                        event,
                        supplierClassInfo.class === 'L'
                          ? leftoverReduction
                          : totalReduction,
                      );
                    }}
                    name="creditOption"
                    value="B"
                  />
                </td>
              </tr>
              {unspecifiedReductions && (
                <>
                  <tr>
                    <td className="text-blue">
                      &bull; &nbsp; &nbsp; {reportYear} Credits
                    </td>
                    <td className="text-center text-red">
                      {unspecifiedReductions.currentYearA
                        ? -unspecifiedReductions.currentYearA
                        : 0}
                    </td>
                    <td className="text-center text-red">
                      {unspecifiedReductions.currentYearB
                        ? -unspecifiedReductions.currentYearB
                        : 0}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-blue">
                      &bull; &nbsp; &nbsp; {reportYear - 1} Credits
                    </td>
                    <td className="text-center text-red">
                      {unspecifiedReductions.lastYearA
                        ? -unspecifiedReductions.lastYearA
                        : 0}
                    </td>
                    <td className="text-center text-red">
                      {unspecifiedReductions.lastYearB
                        ? -unspecifiedReductions.lastYearB
                        : 0}
                    </td>
                  </tr>
                </>
              )}
              {/* {offsetNumbers && Object.keys(offsetNumbers).map((year) => (
                <tr key={year}>
                  <td>
                    &bull; &nbsp; &nbsp; {year} Credits
                  </td>
                  <td className="text-center">
                    <input
                      name="A"
                      id={`${year}-A`}
                      onChange={(event) => { handleOffsetChange(event); }}
                      type="number"
                    />
                  </td>
                  <td className="text-center">
                    <input
                      name="B"
                      id={`${year}-B`}
                      onChange={(event) => { handleOffsetChange(event); }}
                      type="number"
                    />
                  </td>
                </tr>
              ))} */}
            </tbody>
          </table>
        </div>
      </div>

      {((creditBalance.A && creditBalance.A > 0) || (creditBalance.B && creditBalance.B > 0)) && (
      <div className="col-12 mt-3">
        <div className="row">
          <table className="col-12">
            <tbody>
              <tr className="subclass">
                <th className="large-column">PROVISIONAL BALANCE AFTER CREDIT REDUCTION</th>
                <th className="small-column text-center text-blue">A</th>
                <th className="small-column text-center text-blue">B</th>
              </tr>
              <tr>
                <td className="text-blue">
                  &bull; &nbsp; &nbsp; {reportYear} Credit
                </td>
                <td className="text-center">
                  {creditBalance.A ? creditBalance.A : 0}
                </td>
                <td className="text-center">
                  {creditBalance.B ? creditBalance.B : 0}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      )}

      {(creditBalance.creditADeficit > 0 || creditBalance.unspecifiedCreditDeficit > 0) && (
      <div className="col-12 mt-3">
        <div className="row">
          <table className="col-12">
            <tbody>
              <tr className="subclass">
                <th className="large-column">BALANCE AFTER CREDIT REDUCTION</th>
                <th className="small-column text-center text-blue">A</th>
                <th className="small-column text-center text-blue">Unspecified</th>
              </tr>
              <tr>
                <td>Credit Deficit</td>
                <td className="text-center">{creditBalance.creditADeficit}</td>
                <td className="text-center">{creditBalance.unspecifiedCreditDeficit}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      )}
    </>
  );
};

ComplianceObligationReductionOffsetTable.propTypes = {
  creditBalance: PropTypes.shape().isRequired,
  leftoverReduction: PropTypes.number.isRequired,
  reportYear: PropTypes.number.isRequired,
  statuses: PropTypes.shape().isRequired,
  supplierClassInfo: PropTypes.shape().isRequired,
  totalReduction: PropTypes.number.isRequired,
  unspecifiedCreditReduction: PropTypes.func.isRequired,
  unspecifiedReductions: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired,
  zevClassAReduction: PropTypes.shape().isRequired,
};

export default ComplianceObligationReductionOffsetTable;
