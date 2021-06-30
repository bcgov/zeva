import React from 'react';
import PropTypes from 'prop-types';
import formatNumeric from '../../app/utilities/formatNumeric';

import CustomPropTypes from '../../app/utilities/props';

const ComplianceObligationReductionOffsetTable = (props) => {
  const {
    handleUnspecifiedCreditReduction,
    supplierClass,
    zevClassAReduction,
    reportYear,
    creditBalance,
    user,
    statuses,
    creditReductionSelection,
    classAReductions,
    unspecifiedReductions,
  } = props;

  return (
    <>
      <div className="col-12">
        <div className="row">
          <table className="col-12">
            <tbody>
              {supplierClass === 'L' && (
                <>
                  <tr className="subclass">
                    <th className="large-column">ZEV Class A Credit Reduction</th>
                    <th className="small-column text-center text-blue">A</th>
                    <th className="small-column text-center text-blue">B</th>
                  </tr>
                  {classAReductions && classAReductions.map((reduction) => (
                    <tr>
                      <td className="text-blue">
                        &bull; &nbsp; &nbsp; {reduction.modelYear} Credits
                      </td>
                      <td className={`text-right ${reduction.value > 0 ? 'text-red' : ''}`}>
                        {formatNumeric(reduction.value
                          ? -reduction.value
                          : 0)}
                      </td>
                      <td className="text-right">{formatNumeric(0)}</td>
                    </tr>
                  ))}
                  {/* <tr>
                    <td className="text-blue">
                      &bull; &nbsp; &nbsp; {reportYear - 1} Credits
                    </td>
                    <td className={`text-right ${zevClassAReduction.lastYearA > 0 ? 'text-red' : ''}`}>
                      {formatNumeric(zevClassAReduction.lastYearA
                        ? -zevClassAReduction.lastYearA
                        : 0)}
                    </td>
                    <td className="text-right">{formatNumeric(0)}</td>
                  </tr> */}
                  {/* <tr>
                    <td className="text-blue">
                      &bull; &nbsp; &nbsp; {reportYear} Credits
                    </td>
                    <td className={`text-right ${zevClassAReduction.currentYearA > 0 ? 'text-red' : ''}`}>
                      {formatNumeric(zevClassAReduction.currentYearA
                        ? -zevClassAReduction.currentYearA
                        : 0)}
                    </td>
                    <td className="text-right">{formatNumeric(0)}</td>
                  </tr> */}
                  <tr className="subclass">
                    <th className="large-column">
                      Unspecified ZEV Class Credit Reduction
                    </th>
                    <th className="text-center">A</th>
                    <th className="text-center">B</th>
                  </tr>
                </>
              )}
              {supplierClass !== 'L' && (
                <tr className="subclass">
                  <th className="large-column">
                    Compliance Ratio Credit Reduction
                  </th>
                  <th className="text-center small-column">A</th>
                  <th className="text-center small-column">B</th>
                </tr>
              )}
              <tr className="credit-selection">
                <td>
                  Do you want to use ZEV Class A or B credits first for your
                  unspecified ZEV class reduction?
                </td>
                <td className="text-center">
                  <input
                    checked={creditReductionSelection === 'A'}
                    disabled={user.isGovernment || ['SUBMITTED', 'CONFIRMED', 'ASSESSED'].indexOf(statuses.complianceObligation.status) >= 0}
                    type="radio"
                    id="A"
                    onChange={(event) => {
                      const { id: radioId } = event.target;
                      handleUnspecifiedCreditReduction(radioId);
                    }}
                    name="creditOption"
                    value="A"
                  />
                </td>
                <td className="text-center">
                  <input
                    checked={creditReductionSelection === 'B'}
                    disabled={user.isGovernment || ['SUBMITTED', 'CONFIRMED', 'ASSESSED'].indexOf(statuses.complianceObligation.status) >= 0}
                    className="text-center"
                    type="radio"
                    id="B"
                    onChange={(event) => {
                      const { id: radioId } = event.target;
                      handleUnspecifiedCreditReduction(radioId);
                    }}
                    name="creditOption"
                    value="B"
                  />
                </td>
              </tr>
              {unspecifiedReductions && unspecifiedReductions.map((reduction) => (
                <tr>
                  <td className="text-blue">
                    &bull; &nbsp; &nbsp; {reduction.modelYear} Credits
                  </td>
                  <td className={`text-right ${reduction.value > 0 ? 'text-red' : ''}`}>
                    {formatNumeric(reduction.value
                      ? -reduction.value
                      : 0)}
                  </td>
                  <td className="text-right">{formatNumeric(0)}</td>
                </tr>
              ))}
              {/* {unspecifiedReductions && (
                <>
                  <tr>
                    <td className="text-blue">
                      &bull; &nbsp; &nbsp; {reportYear - 1} Credits
                    </td>
                    <td className={`text-right ${unspecifiedReductions.lastYearA > 0 ? 'text-red' : ''}`}>
                      {formatNumeric(unspecifiedReductions.lastYearA
                        ? -unspecifiedReductions.lastYearA
                        : 0)}
                    </td>
                    <td className={`text-right ${unspecifiedReductions.lastYearB > 0 ? 'text-red' : ''}`}>
                      {formatNumeric(unspecifiedReductions.lastYearB
                        ? -unspecifiedReductions.lastYearB
                        : 0)}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-blue">
                      &bull; &nbsp; &nbsp; {reportYear} Credits
                    </td>
                    <td className={`text-right ${unspecifiedReductions.currentYearA > 0 ? 'text-red' : ''}`}>
                      {formatNumeric(unspecifiedReductions.currentYearA
                        ? -unspecifiedReductions.currentYearA
                        : 0)}
                    </td>
                    <td className={`text-right ${unspecifiedReductions.currentYearB > 0 ? 'text-red' : ''}`}>
                      {formatNumeric(unspecifiedReductions.currentYearB
                        ? -unspecifiedReductions.currentYearB
                        : 0)}
                    </td>
                  </tr>
                </>
              )} */}
            </tbody>
          </table>
        </div>
      </div>

      {((creditBalance.A > 0) || (creditBalance.B > 0)) && (
      <div className="col-12 mt-3">
        <div className="row">
          <table className="col-12">
            <tbody>
              <tr className="subclass">
                <th className="large-column">Provisional Balance after Credit Reduction</th>
                <th className="small-column text-center text-blue">A</th>
                <th className="small-column text-center text-blue">B</th>
              </tr>
              <tr>
                <td className="text-blue">
                  &bull; &nbsp; &nbsp; {reportYear} Credit
                </td>
                <td className="text-right">
                  {formatNumeric(creditBalance.A ? creditBalance.A : 0)}
                </td>
                <td className="text-right">
                  {formatNumeric(creditBalance.B ? creditBalance.B : 0)}
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
                <td className="text-right">
                  {Number(creditBalance.creditADeficit) > 0 && (
                    <span>({formatNumeric(creditBalance.creditADeficit)})</span>
                  )}
                  {Number(creditBalance.creditADeficit) <= 0 && (
                    <span>{formatNumeric(creditBalance.creditADeficit)}</span>
                  )}
                </td>
                <td className="text-right">
                  {Number(creditBalance.unspecifiedCreditDeficit) > 0 && (
                    <span>({formatNumeric(creditBalance.unspecifiedCreditDeficit)})</span>
                  )}
                  {Number(creditBalance.unspecifiedCreditDeficit) <= 0 && (
                    <span>{formatNumeric(creditBalance.unspecifiedCreditDeficit)}</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      )}
    </>
  );
};

ComplianceObligationReductionOffsetTable.defaultProps = {
  creditReductionSelection: null,
};

ComplianceObligationReductionOffsetTable.propTypes = {
  creditBalance: PropTypes.shape().isRequired,
  creditReductionSelection: PropTypes.string,
  reportYear: PropTypes.number.isRequired,
  statuses: PropTypes.shape().isRequired,
  supplierClass: PropTypes.string.isRequired,
  handleUnspecifiedCreditReduction: PropTypes.func.isRequired,
  user: CustomPropTypes.user.isRequired,
  zevClassAReduction: PropTypes.shape().isRequired,
  classAReductions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  unspecifiedReductions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

export default ComplianceObligationReductionOffsetTable;
