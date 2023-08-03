import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import formatNumeric from '../../app/utilities/formatNumeric'

import CustomPropTypes from '../../app/utilities/props'

const ComplianceObligationReductionOffsetTable = (props) => {
  const {
    creditReductionSelection,
    deductions,
    handleUnspecifiedCreditReduction,
    pendingBalanceExist,
    statuses,
    supplierClass,
    updatedBalances,
    user,
    assessment,
    reportYear
  } = props

  return (
    <>
      <div className="col-12">
        <div className="row">
          {deductions && (
            <table className="col-12">
              <tbody>
                {supplierClass === 'L' && (
                  <>
                    {deductions.filter(
                      (deduction) => deduction.type === 'classAReduction'
                    ).length > 0 && (
                      <tr className="subclass">
                        <th className="large-column">
                          ZEV Class A Credit Reduction
                        </th>
                        <th className="small-column text-center text-blue">
                          A
                        </th>
                        <th className="small-column text-center text-blue">
                          B
                        </th>
                      </tr>
                    )}
                    {deductions
                      .filter(
                        (deduction) => deduction.type === 'classAReduction'
                      )
                      .map((deduction) => (
                        <tr key={deduction.modelYear}>
                          <td className="text-blue">
                            &bull; &nbsp; &nbsp; {deduction.modelYear} Credits
                          </td>
                          <td className="text-right">
                            {deduction.creditA > 0 && (
                              <span className="text-red">
                                -{formatNumeric(deduction.creditA, 2)}
                              </span>
                            )}
                            {!deduction.creditA && <span>0.00</span>}
                          </td>
                          <td className="text-right">
                            {deduction.creditB > 0 && (
                              <span className="text-red">
                                -{formatNumeric(deduction.creditB, 2)}
                              </span>
                            )}
                            {!deduction.creditB && <span>0.00</span>}
                          </td>
                        </tr>
                      ))}
                    <tr className="subclass">
                      <th className="large-column">
                        Unspecified ZEV Class Credit Reduction
                      </th>
                      <th className="small-column text-center text-blue">A</th>
                      <th className="small-column text-center text-blue">B</th>
                    </tr>
                  </>
                )}
                {supplierClass !== 'L' ||  supplierClass !== 'S' && (
                  <tr className="subclass">
                    <th className="large-column">
                      Compliance Ratio Credit Reduction
                    </th>
                    <th className="text-center small-column">A</th>
                    <th className="text-center small-column">B</th>
                  </tr>
                )}
                {supplierClass !== 'S' && (
                  <tr className="credit-selection">
                  <td>
                    Do you want to use ZEV Class A or B credits first for your
                    unspecified ZEV class reduction?
                  </td>
                  <td className="text-center">
                    {statuses.assessment.status !== 'ASSESSED' && (
                      <input
                        checked={creditReductionSelection === 'A'}
                        disabled={
                          user.isGovernment ||
                          ['SUBMITTED', 'CONFIRMED', 'ASSESSED'].indexOf(
                            statuses.complianceObligation.status
                          ) >= 0
                        }
                        type="radio"
                        id="A"
                        onChange={(event) => {
                          const { id: radioId } = event.target
                          handleUnspecifiedCreditReduction(radioId)
                        }}
                        name="creditOption"
                        value="A"
                      />
                    )}
                    {statuses &&
                      statuses.assessment &&
                      statuses.assessment.status === 'ASSESSED' &&
                      creditReductionSelection === 'A' && (
                        <FontAwesomeIcon icon="check" />
                    )}
                  </td>
                  <td className="text-center">
                    {statuses &&
                      statuses.assessment &&
                      statuses.assessment.status !== 'ASSESSED' && (
                        <input
                          checked={creditReductionSelection === 'B'}
                          disabled={
                            user.isGovernment ||
                            ['SUBMITTED', 'CONFIRMED', 'ASSESSED'].indexOf(
                              statuses.complianceObligation.status
                            ) >= 0
                          }
                          className="text-center"
                          type="radio"
                          id="B"
                          onChange={(event) => {
                            const { id: radioId } = event.target
                            handleUnspecifiedCreditReduction(radioId)
                          }}
                          name="creditOption"
                          value="B"
                        />
                    )}
                    {statuses &&
                      statuses.assessment &&
                      statuses.assessment.status === 'ASSESSED' &&
                      creditReductionSelection === 'B' && (
                        <FontAwesomeIcon icon="check" />
                    )}
                  </td>
                </tr>
                )}
                {deductions
                  .filter(
                    (deduction) =>
                      deduction.type === 'unspecifiedReduction' &&
                      (deduction.creditA > 0 || deduction.creditB > 0)
                  )
                  .map((deduction) => (
                    <tr key={deduction.modelYear}>
                      <td className="text-blue">
                        &bull; &nbsp; &nbsp; {deduction.modelYear} Credits
                      </td>
                      <td className="text-right">
                        {deduction.creditA > 0 && (
                          <span className="text-red">
                            -{formatNumeric(deduction.creditA, 2)}
                          </span>
                        )}
                        {!deduction.creditA && <span>0.00</span>}
                      </td>
                      <td className="text-right">
                        {deduction.creditB > 0 && (
                          <span className="text-red">
                            -{formatNumeric(deduction.creditB, 2)}
                          </span>
                        )}
                        {!deduction.creditB && <span>0.00</span>}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
          {updatedBalances && updatedBalances.deficits.length > 0 && (
            <div className="mt-2">
              By selecting the ZEV Class {creditReductionSelection} credit
              preference your unspecified credit deficit will be offset
              automatically using ZEV Class {creditReductionSelection} credits
              in the next adjustment period if the grace year applies.
            </div>
          )}
        </div>
      </div>

      {updatedBalances && (
        <div className="col-12 mt-3">
          <div className="row">
            <table className="col-12">
              <tbody>
                <tr className="subclass">
                  {!assessment && (
                    <th className="large-column">
                      {pendingBalanceExist ? 'PROVISIONAL ' : ''}
                      BALANCE AFTER CREDIT REDUCTION
                    </th>
                  )}
                  {assessment && (
                    <th className="large-column">
                      ASSESSED BALANCE AT END OF SEPT. 30, {reportYear + 1}
                    </th>
                  )}
                  <th className="small-column text-center text-blue">A</th>
                  <th className="small-column text-center text-blue">
                    {updatedBalances.deficits.filter(
                      (deficit) => deficit.creditB > 0
                    ).length > 0
                      ? 'Unspecified'
                      : 'B'}
                  </th>
                </tr>
                {updatedBalances.balances &&
                  updatedBalances.balances
                    .filter(
                      (balance) => balance.creditA > 0 || balance.creditB > 0
                    )
                    .map((balance) => (
                      <tr key={balance.modelYear}>
                        <td className="text-blue">
                          &bull; &nbsp; &nbsp; {balance.modelYear} Credits
                        </td>
                        <td className="text-right">
                          {formatNumeric(balance.creditA ? balance.creditA : 0)}
                        </td>
                        <td className="text-right">
                          {formatNumeric(balance.creditB ? balance.creditB : 0)}
                        </td>
                      </tr>
                    ))}
                {updatedBalances.deficits.map((deficit) => (
                  <tr key={deficit.modelYear}>
                    <td className="text-blue background-danger">
                      &bull; &nbsp; &nbsp; Credit Deficit
                    </td>
                    <td className="text-right background-danger">
                      {Number(deficit.creditA) > 0 && (
                        <span>({formatNumeric(deficit.creditA)})</span>
                      )}
                      {!deficit.creditA && <span>0.00</span>}
                    </td>
                    <td className="text-right background-danger">
                      {Number(deficit.creditB) > 0 && (
                        <span>({formatNumeric(deficit.creditB)})</span>
                      )}
                      {!deficit.creditB && <span>0.00</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}

ComplianceObligationReductionOffsetTable.defaultProps = {
  creditReductionSelection: null,
  pendingBalanceExist: false,
  handleUnspecifiedCreditReduction: () => {}
}

ComplianceObligationReductionOffsetTable.propTypes = {
  creditReductionSelection: PropTypes.string,
  deductions: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  handleUnspecifiedCreditReduction: PropTypes.func,
  pendingBalanceExist: PropTypes.bool,
  assessment: PropTypes.bool,
  reportYear: PropTypes.number,
  statuses: PropTypes.shape().isRequired,
  supplierClass: PropTypes.string.isRequired,
  updatedBalances: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired
}

export default ComplianceObligationReductionOffsetTable
