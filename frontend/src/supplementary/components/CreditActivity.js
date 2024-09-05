import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Big from 'big.js'

import ComplianceObligationTableCreditsIssued from '../../compliance/components/ComplianceObligationTableCreditsIssued'
import Loading from '../../app/components/Loading'
import formatNumeric from '../../app/utilities/formatNumeric'
import getComplianceObligationDetails from '../../app/utilities/getComplianceObligationDetails'
import calculateCreditReductionBig from '../../app/utilities/calculateCreditReductionBig'
import getClassAReductionBig from '../../app/utilities/getClassAReductionBig'
import getTotalReductionBig from '../../app/utilities/getTotalReductionBig'
import getUnspecifiedClassReductionBig from '../../app/utilities/getUnspecifiedClassReductionBig'
import { convertBalances, convertCarryOverDeficits } from '../../app/utilities/convertToBig'

const CreditActivity = (props) => {
  const {
    creditReductionSelection,
    details,
    handleInputChange,
    handleSupplementalChange,
    ldvSales,
    newBalances,
    newData,
    obligationDetails,
    ratios,
    supplierClass,
    isEditable
  } = props

  const bigZero = new Big(0)

  let newLdvSales =
    newData && newData.supplierInfo && newData.supplierInfo.ldvSales

  if (newLdvSales === null || !newLdvSales) {
    newLdvSales = ldvSales
  }

  useEffect(() => {
    const structuredProvisionalBalances = []

    updatedBalances.balances.forEach((obj, i) => {
      const structuredProvisionalBalance = {}
      structuredProvisionalBalance.title = 'ProvisionalBalanceAfterCreditReduction'
      structuredProvisionalBalance.modelYear = updatedBalances.balances[i].modelYear
      structuredProvisionalBalance.creditA = updatedBalances.balances[i].newCreditA
      structuredProvisionalBalance.creditB = updatedBalances.balances[i].newCreditB
      structuredProvisionalBalance.originalAValue = updatedBalances.balances[i].creditA
      structuredProvisionalBalance.originalBValue = updatedBalances.balances[i].creditB
      structuredProvisionalBalances.push(structuredProvisionalBalance)
    })

    updatedBalances.deficits.forEach((obj, i) => {
      const structuredProvisionalBalance = {}
      structuredProvisionalBalance.title = 'CreditDeficit'
      structuredProvisionalBalance.modelYear = updatedBalances.deficits[i].modelYear
      structuredProvisionalBalance.creditA = updatedBalances.deficits[i].newCreditA || 0
      structuredProvisionalBalance.creditB = updatedBalances.deficits[i].newCreditB || 0
      structuredProvisionalBalance.originalAValue = updatedBalances.deficits[i].creditA
      structuredProvisionalBalance.originalBValue = updatedBalances.deficits[i].creditB
      structuredProvisionalBalances.push(structuredProvisionalBalance)
    })

    handleSupplementalChange(structuredProvisionalBalances)
  }, [newLdvSales])

  let reportYear = false

  if (details && details.assessmentData) {
    reportYear = Number(details.assessmentData.modelYear)
  }

  if (!reportYear) {
    return <Loading />
  }

  const {
    creditBalanceEnd,
    creditBalanceStart,
    creditsIssuedSales,
    pendingBalance,
    provisionalBalance,
    transfersIn,
    transfersOut,
    initiativeAgreement,
    purchaseAgreement,
    administrativeAllocation,
    administrativeReduction,
    automaticAdministrativePenalty,
    carryOverDeficits
  } = getComplianceObligationDetails(obligationDetails, creditReductionSelection)

  const reportDetails = {
    creditBalanceStart,
    creditBalanceEnd,
    pendingBalance,
    provisionalBalance,
    transactions: {
      creditsIssuedSales,
      transfersIn,
      transfersOut,
      initiativeAgreement,
      purchaseAgreement,
      administrativeAllocation,
      administrativeReduction,
      automaticAdministrativePenalty
    }
  }

  const totalReduction = getTotalReductionBig(ldvSales, ratios.complianceRatio, supplierClass)
  const classAReduction = getClassAReductionBig(
    ldvSales,
    ratios.zevClassA,
    supplierClass
  )
  const leftoverReduction = getUnspecifiedClassReductionBig(
    ldvSales,
    ratios.complianceRatio,
    ratios.zevClassA,
    supplierClass
  )
  const newTotalReduction = getTotalReductionBig(
    newLdvSales,
    ratios.complianceRatio,
    supplierClass
  )
  const newClassAReduction = getClassAReductionBig(
    newLdvSales,
    ratios.zevClassA,
    supplierClass
  )
  const newLeftoverReduction = getUnspecifiedClassReductionBig(
    newLdvSales,
    ratios.complianceRatio,
    ratios.zevClassA,
    supplierClass
  )

  const classAReductions = [
    {
      modelYear: Number(reportYear),
      value: new Big(classAReduction.toFixed(2))
    }
  ]

  const newClassAReductions = [
    {
      modelYear: Number(reportYear),
      value:
        (new Big(newClassAReduction.toFixed(2))).gte(bigZero)
          ? new Big(newClassAReduction.toFixed(2))
          : new Big(classAReduction.toFixed(2))
    }
  ]

  const unspecifiedReductions = [
    {
      modelYear: Number(reportYear),
      value: new Big(leftoverReduction.toFixed(2))
    }
  ]

  const newUnspecifiedReductions = [
    {
      modelYear: Number(reportYear),
      value:
        (new Big(newLeftoverReduction.toFixed(2))).gte(bigZero)
          ? new Big(newLeftoverReduction.toFixed(2))
          : new Big(leftoverReduction.toFixed(2))
    }
  ]

  const tempBalances = []
  const newTempBalances = []

  Object.keys(provisionalBalance).forEach((year) => {
    const { A: creditA, B: creditB } = provisionalBalance[year]

    tempBalances.push({
      modelYear: Number(year),
      creditA,
      creditB
    })
  })
  Object.keys(newBalances).forEach((year) => {
    const { A: creditA, B: creditB } = newBalances[year]
    newTempBalances.push({
      modelYear: Number(year),
      creditA,
      creditB
    })
  })

  convertBalances(tempBalances)
  convertCarryOverDeficits(carryOverDeficits)
  const creditReduction = calculateCreditReductionBig(
    tempBalances,
    classAReductions,
    unspecifiedReductions,
    creditReductionSelection,
    carryOverDeficits
  )

  convertBalances(newTempBalances)
  const newCreditReduction = calculateCreditReductionBig(
    newTempBalances,
    newClassAReductions,
    newUnspecifiedReductions,
    creditReductionSelection,
    carryOverDeficits
  )

  const { deductions } = creditReduction
  const { deductions: newDeductions } = newCreditReduction

  const getAssociatedDeduction = (deduction, arr) => {
    const values = {
      creditA: bigZero,
      creditB: bigZero
    }

    const found = arr.find(
      (each) =>
        Number(each.modelYear) === Number(deduction.modelYear) &&
        each.type === deduction.type
    )

    if (found) {
      values.creditA = found.creditA
      values.creditB = found.creditB
    }

    return values
  }

  const updatedBalances = {
    balances: [],
    deficits: []
  }
  const { balances, deficits } = creditReduction

  balances.forEach((balance) => {
    const tempBalance = balance

    const found = newCreditReduction.balances.find(
      (each) => each.modelYear === balance.modelYear
    )

    if (found && newTempBalances.length > 0) {
      tempBalance.newCreditA = found.creditA
      tempBalance.newCreditB = found.creditB
    }

    updatedBalances.balances.push(tempBalance)
  })

  if (newTempBalances.length > 0) {
    newCreditReduction.balances.forEach((each) => {
      const index = updatedBalances.balances.findIndex(
        (balance) => balance.modelYear === each.modelYear
      )

      if (index < 0) {
        updatedBalances.balances.push({
          modelYear: each.modelYear,
          creditA: 0,
          creditB: 0,
          newCreditA: each.creditA,
          newCreditB: each.creditB
        })
      }
    })
  }

  deficits.forEach((balance) => {
    const tempBalance = balance

    const found = newCreditReduction.deficits.find(
      (each) => each.modelYear === balance.modelYear
    )

    if (found && newTempBalances.length > 0) {
      tempBalance.newCreditA = found.creditA
      tempBalance.newCreditB = found.creditB
    }

    updatedBalances.deficits.push(tempBalance)
  })

  if (newTempBalances.length > 0) {
    newCreditReduction.deficits.forEach((each) => {
      const index = updatedBalances.deficits.findIndex(
        (balance) => balance.modelYear === each.modelYear
      )

      if (index < 0) {
        updatedBalances.deficits.push({
          modelYear: each.modelYear,
          creditA: 0,
          creditB: 0,
          newCreditA: each.creditA,
          newCreditB: each.creditB
        })
      }
    })
  }

  return (
    <>
      <h3>Compliance Obligation</h3>
      <div className="text-blue my-3">
        A change to the LDV sales total could result in a change of compliance
        status for this and any subsequent model year reports. Provide an
        explanation for any change to the LDV Sales total in the comment box at
        the bottom of this form.
      </div>
      <div className="compliance-reduction-table mb-3">
        <div className="row mb-4 ">
          <div className="col-12 p-2">
            <table className="no-border">
              <tbody>
                <tr>
                  <td className="text-blue" width="30%">
                    {reportYear} {reportYear < 2024 ? "Model Year LDV Sales" : "Vehicles Supplied"}:
                  </td>
                  <td className="text-right" width="10%">
                    {formatNumeric(ldvSales, 0)}
                  </td>
                  <td width="10%">
                    <input
                      className={`form-control ${
                        Number(ldvSales) !== Number(newLdvSales)
                          ? 'highlight'
                          : ''
                      }`}
                      id="ldvSales"
                      name="supplierInfo"
                      type="text"
                      onChange={handleInputChange}
                      defaultValue={formatNumeric(newLdvSales, 0)}
                      readOnly={!isEditable}
                    />
                  </td>
                  <td className="text-blue font-weight-bold" width="30%">
                    Compliance Ratio Credit Reduction:
                  </td>
                  <td className="font-weight-bold text-right" width="10%">
                    {formatNumeric(totalReduction, 2)}
                  </td>
                  <td
                    className={`font-weight-bold text-right ${
                      !(totalReduction.eq(newTotalReduction)) ? 'highlight' : ''
                    }`}
                  >
                    {newLdvSales >= 0 && (
                      <span>{formatNumeric(newTotalReduction, 2)}</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="text-blue">{reportYear} Compliance Ratio:</td>
                  <td className="text-right">{ratios.complianceRatio} %</td>
                  <td />
                  {supplierClass === 'L'
                    ? (
                    <>
                      <td className="text-blue">
                        &bull; ZEV Class A Credit Reduction:
                      </td>
                      <td className="text-right">
                        {formatNumeric(classAReduction, 2)}
                      </td>
                      <td
                        className={`text-right ${
                          !(classAReduction.eq(newClassAReduction))
                            ? 'highlight'
                            : ''
                        }`}
                      >
                        {newLdvSales >= 0 && (
                          <span>{formatNumeric(newClassAReduction, 2)}</span>
                        )}
                      </td>
                    </>
                      )
                    : (
                    <>
                      <td className="text-blue">
                        &bull; Unspecified ZEV Class Credit Reduction:
                      </td>
                      <td className="text-right">
                        {formatNumeric(leftoverReduction, 2)}
                      </td>
                      <td
                        className={`text-right ${
                          !(leftoverReduction.eq(newLeftoverReduction))
                            ? 'highlight'
                            : ''
                        }`}
                      >
                        {newLdvSales >= 0 && (
                          <span>{formatNumeric(newLeftoverReduction, 2)}</span>
                        )}
                      </td>
                    </>
                      )}
                </tr>
                {supplierClass === 'L' && (
                  <tr>
                    <td className="text-blue">
                      Large Volume Supplier Class A Ratio:
                    </td>
                    <td className="text-right">{ratios.zevClassA} %</td>
                    <td />
                    <td className="text-blue">
                      &bull; Unspecified ZEV Class Credit Reduction:
                    </td>
                    <td className="text-right">
                      {formatNumeric(leftoverReduction, 2)}
                    </td>
                    <td
                      className={`text-right ${
                        !(leftoverReduction.eq(newLeftoverReduction))
                          ? 'highlight'
                          : ''
                      }`}
                    >
                      {newLdvSales >= 0 && (
                        <span>{formatNumeric(newLeftoverReduction, 2)}</span>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <ComplianceObligationTableCreditsIssued
          handleSupplementalChange={handleSupplementalChange}
          newBalances={newBalances}
          newData={newData}
          pendingBalanceExist={false}
          readOnly={!isEditable}
          reportDetails={reportDetails}
          reportYear={reportYear}
          supplementalReport
        />
      </div>
      <div className="mt-4">
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
                          <th className="small-column text-center text-blue">
                            A
                          </th>
                          <th className="small-column text-center text-blue">
                            B
                          </th>
                        </tr>
                      )}
                      {newDeductions
                        .filter(
                          (deduction) => deduction.type === 'classAReduction'
                        )
                        .map((deduction) => (
                          <tr key={deduction.modelYear}>
                            <td className="text-blue">
                              &bull; &nbsp; &nbsp; {deduction.modelYear} Credits
                            </td>
                            <td className="text-right">
                              {getAssociatedDeduction(deduction, deductions).creditA && getAssociatedDeduction(deduction, deductions)
                                .creditA.gt(bigZero) && (
                                <span className="text-red">
                                  -
                                  {formatNumeric(
                                    getAssociatedDeduction(deduction, deductions)
                                      .creditA,
                                    2
                                  )}
                                </span>
                              )}
                              {getAssociatedDeduction(deduction, deductions)
                                .creditA.eq(bigZero) && <span>0.00</span>}
                            </td>
                            <td className="text-right">
                              {getAssociatedDeduction(deduction, deductions).creditB && getAssociatedDeduction(deduction, deductions)
                                .creditB.gt(bigZero) && (
                                <span className="text-red">
                                  -
                                  {formatNumeric(
                                    getAssociatedDeduction(deduction, deductions)
                                      .creditB,
                                    2
                                  )}
                                </span>
                              )}
                              {getAssociatedDeduction(deduction, deductions).creditB && getAssociatedDeduction(deduction, deductions)
                                .creditB.eq(bigZero) && <span>0.00</span>}
                            </td>
                            <td className={`text-right ${
                              !(deduction.creditA && deduction.creditA.eq(getAssociatedDeduction(deduction, deductions).creditA))
                                ? 'highlight'
                                : ''
                            }`}>
                              {deduction.creditA && deduction.creditA.gt(bigZero) && (
                                <span className="text-red">
                                  -{formatNumeric(deduction.creditA, 2)}
                                </span>
                              )}
                              {deduction.creditA && deduction.creditA.eq(bigZero) && <span>0.00</span>}
                            </td>
                            <td className={`text-right ${
                              !(deduction.creditB.eq(getAssociatedDeduction(deduction, deductions).creditB))
                                ? 'highlight'
                                : ''
                            }`}>
                              {deduction.creditB && deduction.creditB.gt(bigZero) && (
                                <span className="text-red">
                                  -{formatNumeric(deduction.creditB, 2)}
                                </span>
                              )}
                              {deduction.creditB && deduction.creditB.eq(bigZero) && <span>0.00</span>}
                            </td>
                          </tr>
                        ))}
                      <tr className="subclass">
                        <th className="large-column">
                          Unspecified ZEV Class Credit Reduction
                        </th>
                        <th className="small-column text-center text-blue">
                          A
                        </th>
                        <th className="small-column text-center text-blue">
                          B
                        </th>
                        <th className="small-column text-center text-blue">
                          A
                        </th>
                        <th className="small-column text-center text-blue">
                          B
                        </th>
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
                      <th className="text-center small-column">
                        {creditReductionSelection === 'A'
                          ? (
                          <FontAwesomeIcon icon="check" />
                            )
                          : (
                              'A'
                            )}
                      </th>
                      <th className="text-center small-column">
                        {creditReductionSelection === 'B'
                          ? (
                          <FontAwesomeIcon icon="check" />
                            )
                          : (
                              'B'
                            )}
                      </th>
                    </tr>
                  )}
                  {newDeductions
                    .filter(
                      (deduction) =>
                        deduction.type === 'unspecifiedReduction'
                    )
                    .map((deduction) => (
                      <tr key={deduction.modelYear}>
                        <td className="text-blue">
                          &bull; &nbsp; &nbsp; {deduction.modelYear} Credits
                        </td>
                        <td className="text-right">
                          {getAssociatedDeduction(deduction, deductions).creditA && getAssociatedDeduction(deduction, deductions).creditA.gt(bigZero)
                             && (
                            <span className="text-red">
                              -
                              {formatNumeric(
                                getAssociatedDeduction(deduction, deductions)
                                  .creditA,
                                2
                              )}
                            </span>
                          )}
                          {getAssociatedDeduction(deduction, deductions).creditA && getAssociatedDeduction(deduction, deductions)
                            .creditA.eq(bigZero) && <span>0.00</span>}
                        </td>
                        <td className="text-right">
                          {getAssociatedDeduction(deduction, deductions).creditB && getAssociatedDeduction(deduction, deductions).creditB.gt(bigZero)
                            && (
                            <span className="text-red">
                              -
                              {formatNumeric(
                                getAssociatedDeduction(deduction, deductions)
                                  .creditB,
                                2
                              )}
                            </span>
                          )}
                          {getAssociatedDeduction(deduction, deductions).creditB && getAssociatedDeduction(deduction, deductions)
                            .creditB.eq(bigZero) && <span>0.00</span>}
                        </td>
                        <td className={`text-right ${
                          !(getAssociatedDeduction(deduction, deductions).creditA && getAssociatedDeduction(deduction, deductions).creditA.eq(deduction.creditA))
                            ? 'highlight'
                            : ''
                        }`}>
                          {deduction.creditA && deduction.creditA.gt(0) && (
                            <span className="text-red">
                              -{formatNumeric(deduction.creditA, 2)}
                            </span>
                          )}
                          {deduction.creditA && deduction.creditA.eq(bigZero) && <span>0.00</span>}
                        </td>
                        <td className={`text-right ${
                          !(getAssociatedDeduction(deduction, deductions).creditB && getAssociatedDeduction(deduction, deductions).creditB.eq(deduction.creditB))
                            ? 'highlight'
                            : ''
                        }`}>
                          {deduction.creditB.gt(bigZero) && (
                            <span className="text-red">
                              -{formatNumeric(deduction.creditB, 2)}
                            </span>
                          )}
                          {deduction.creditB.eq(bigZero) && <span>0.00</span>}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        {updatedBalances && (
          <div className="col-12 mt-3">
            <div className="row">
              <table className="col-12">
                <tbody>
                  <tr className="subclass">
                    <th className="large-column">
                      ASSESSED BALANCE AT THE END OF SEPT.30,{' '}
                      {Number(reportYear) + 1}
                    </th>
                    <th className="small-column text-center text-blue">A</th>
                    <th className="small-column text-center text-blue">
                      {updatedBalances.deficits.filter(
                        (deficit) => deficit.creditB > 0
                      ).length > 0
                        ? 'Unspecified'
                        : 'B'}
                    </th>
                    <th className="small-column text-center text-blue">A</th>
                    <th className="small-column text-center text-blue">
                      {updatedBalances.deficits.filter(
                        (deficit) => deficit.newCreditB > 0
                      ).length > 0
                        ? 'Unspecified'
                        : 'B'}
                    </th>
                  </tr>
                  {updatedBalances.balances &&
                    updatedBalances.balances
                      .filter(
                        (balance) =>
                          balance.creditA > 0 ||
                          balance.creditB > 0 ||
                          balance.newCreditA > 0 ||
                          balance.newCreditB > 0
                      )
                      .map((balance) => (
                        <tr key={balance.modelYear}>
                          <td className="text-blue">
                            &bull; &nbsp; &nbsp; {balance.modelYear} Credits
                          </td>
                          <td className="text-right">
                            {formatNumeric(
                              balance.creditA ? balance.creditA : 0
                            )}
                          </td>
                          <td className="text-right">
                            {formatNumeric(
                              balance.creditB ? balance.creditB : 0
                            )}
                          </td>
                          <td
                            className={`text-right ${
                              !(balance.creditA.eq(balance.newCreditA))
                                ? 'highlight'
                                : ''
                            }`}
                          >
                            {formatNumeric(
                              balance.newCreditA ? balance.newCreditA : 0
                            )}
                          </td>
                          <td
                            className={`text-right ${
                              !balance.creditB.eq(balance.newCreditB)
                                ? 'highlight'
                                : ''
                            }`}
                          >
                            {formatNumeric(
                              balance.newCreditB ? balance.newCreditB : 0
                            )}
                          </td>
                        </tr>
                      ))}
                  {updatedBalances.deficits.map((deficit) => (
                    <tr key={deficit.modelYear}>
                      <td className="text-blue background-danger">
                        &bull; &nbsp; &nbsp; Credit Deficit
                      </td>
                      <td className="text-right background-danger">
                        {deficit.creditA && deficit.creditA.gt(bigZero) && (
                          <span>({formatNumeric(deficit.creditA)})</span>
                        )}
                        {deficit.creditA && deficit.creditA.eq(bigZero) && <span>0.00</span>}
                      </td>
                      <td className="text-right background-danger">
                        {deficit.creditB && deficit.creditB.gt(bigZero) && (
                          <span>({formatNumeric(deficit.creditB)})</span>
                        )}
                        {deficit.creditB && deficit.creditB.eq(bigZero) && <span>0.00</span>}
                      </td>
                      <td className="text-right background-danger">
                        {deficit.newCreditA && deficit.newCreditA.gt(bigZero) && (
                          <span>({formatNumeric(deficit.newCreditA)})</span>
                        )}
                      </td>
                      <td className="text-right background-danger">
                        {deficit.newCreditB && deficit.newCreditB.gt(bigZero) && (
                          <span>({formatNumeric(deficit.newCreditB)})</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

CreditActivity.defaultProps = {
  creditReductionSelection: '',
  isEditable: false,
  supplierClass: ''
}

CreditActivity.propTypes = {
  creditReductionSelection: PropTypes.string,
  details: PropTypes.shape().isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleSupplementalChange: PropTypes.func.isRequired,
  isEditable: PropTypes.bool,
  ldvSales: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  newBalances: PropTypes.shape().isRequired,
  newData: PropTypes.shape().isRequired,
  obligationDetails: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  ratios: PropTypes.shape().isRequired,
  supplierClass: PropTypes.string
}

export default CreditActivity
