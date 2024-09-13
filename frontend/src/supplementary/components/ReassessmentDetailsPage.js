// intended only for directors to view an assessed reassessment

import React, { useEffect } from 'react'
import Big from 'big.js'
import calculateCreditReductionBig from '../../app/utilities/calculateCreditReductionBig'
import getClassAReductionBig from '../../app/utilities/getClassAReductionBig'
import getComplianceObligationDetails from '../../app/utilities/getComplianceObligationDetails'
import getTotalReductionBig from '../../app/utilities/getTotalReductionBig'
import getUnspecifiedClassReductionBig from '../../app/utilities/getUnspecifiedClassReductionBig'
import ComplianceObligationAmountsTable from '../../compliance/components/ComplianceObligationAmountsTable'
import ComplianceObligationReductionOffsetTable from '../../compliance/components/ComplianceObligationReductionOffsetTable'
import ComplianceObligationTableCreditsIssued from '../../compliance/components/ComplianceObligationTableCreditsIssued'
import NoticeOfAssessmentSection from '../../compliance/components/NoticeOfAssessmentSection'
import constructReassessmentReductions from '../../app/utilities/constructReassessmentReductions'
import { getNewBalancesStructure } from '../../app/utilities/getNewStructures'
import { convertBalances, convertCarryOverDeficits } from '../../app/utilities/convertToBig'

const ReassessmentDetailsPage = (props) => {
  // from props, reconcile existing data with new data, then pass to downstream components
  // here, reconciliation means using new data if some exist; otherwise use the old data
  const {
    details,
    ldvSales,
    newBalances,
    newData,
    obligationDetails,
    ratios,
    user,
    setReassessmentReductions
  } = props

  let supplierName = details.assessmentData.legalName
  if (newData && newData.supplierInfo && newData.supplierInfo.legalName) {
    supplierName = newData.supplierInfo.legalName
  }
  const addresses = details.assessmentData.reportAddress
  let reassessmentRecordsAddress
  let reassessmentServiceAddress
  if (newData.supplierInfo && newData.supplierInfo.recordsAddress) {
    reassessmentRecordsAddress = newData.supplierInfo.recordsAddress
  }
  if (newData.supplierInfo && newData.supplierInfo.serviceAddress) {
    reassessmentServiceAddress = newData.supplierInfo.serviceAddress
  }
  let makes = details.assessmentData.makes
  if (newData && newData.supplierInfo && newData.supplierInfo.ldvMakes) {
    makes = newData.supplierInfo.ldvMakes.split('\n')
  }

  let supplierClass = details.assessmentData.supplierClass
  if (newData && newData.supplierInfo && newData.supplierInfo.supplierClass) {
    supplierClass = newData.supplierInfo.supplierClass
  }
  if (supplierClass !== 'S' || supplierClass !== 'M' || supplierClass !== 'L') {
    const transformedSupplierClass = supplierClass
      .replace(' ', '')
      .toLowerCase()
    if (transformedSupplierClass.includes('small')) {
      supplierClass = 'S'
    } else if (transformedSupplierClass.includes('medium')) {
      supplierClass = 'M'
    } else if (transformedSupplierClass.includes('large')) {
      supplierClass = 'L'
    }
  }

  const reportYear = Number(details.assessmentData.modelYear)

  let classAReductionValue = getClassAReductionBig(
    ldvSales,
    ratios.zevClassA,
    supplierClass
  )
  const prevClassAReductionValue = classAReductionValue
  if (newData && newData.supplierInfo && newData.supplierInfo.ldvSales) {
    classAReductionValue = getClassAReductionBig(
      newData.supplierInfo.ldvSales,
      ratios.zevClassA,
      supplierClass
    )
  }

  const prevClassAReductions = [
    {
      modelYear: reportYear,
      value: new Big(prevClassAReductionValue.toFixed(2))
    }
  ]

  const classAReductions = [
    {
      modelYear: reportYear,
      value: new Big(classAReductionValue.toFixed(2))
    }
  ]

  let sales = details.ldvSales
  if (newData && newData.supplierInfo && newData.supplierInfo.ldvSales) {
    sales = newData.supplierInfo.ldvSales
  }

  let totalReduction = getTotalReductionBig(ldvSales, ratios.complianceRatio, supplierClass)
  if (newData && newData.supplierInfo && newData.supplierInfo.ldvSales) {
    totalReduction = getTotalReductionBig(
      newData.supplierInfo.ldvSales,
      ratios.complianceRatio,
      supplierClass
    )
  }
  totalReduction = new Big(totalReduction.toFixed(2))

  let unspecifiedReductionValue = getUnspecifiedClassReductionBig(
    ldvSales,
    ratios.complianceRatio,
    ratios.zevClassA,
    supplierClass
  )
  const prevUnspecifiedReductionValue = unspecifiedReductionValue
  if (newData && newData.supplierInfo && newData.supplierInfo.ldvSales) {
    unspecifiedReductionValue = getUnspecifiedClassReductionBig(
      newData.supplierInfo.ldvSales,
      ratios.complianceRatio,
      ratios.zevClassA,
      supplierClass
    )
  }

  const prevUnspecifiedReductions = [
    {
      modelYear: reportYear,
      value: new Big(prevUnspecifiedReductionValue.toFixed(2))
    }
  ]

  const unspecifiedReductions = [
    {
      modelYear: reportYear,
      value: new Big(unspecifiedReductionValue.toFixed(2))
    }
  ]

  const newCreditActivities = {}
  if (newData && newData.creditActivity) {
    for (const i in newData.creditActivity) {
      const activity = newData.creditActivity[i]
      const category = activity.category
      const modelYear = activity.modelYear
      const value = {
        creditAValue: activity.creditAValue,
        creditBValue: activity.creditBValue
      }
      if (!newCreditActivities[category]) {
        newCreditActivities[category] = {}
      }
      newCreditActivities[category][modelYear] = { value, index: i }
    }
  }

  const indicesOfIncludedNewCreditActivities = []
  const complianceObligationDetails = []
  for (const detail of obligationDetails) {
    const category = detail.category
    const modelYear = detail.modelYear.name
    if (
      newCreditActivities[category] &&
      newCreditActivities[category][modelYear]
    ) {
      indicesOfIncludedNewCreditActivities.push(
        newCreditActivities[category][modelYear].index
      )
      complianceObligationDetails.push({
        ...detail,
        ...newCreditActivities[category][modelYear].value
      })
    } else {
      complianceObligationDetails.push(detail)
    }
  }

  if (newData && newData.creditActivity) {
    for (const i in newData.creditActivity) {
      const activity = newData.creditActivity[i]
      if (!indicesOfIncludedNewCreditActivities.includes(i)) {
        const actualModelYear = activity.modelYear
        const effectiveDate = actualModelYear + '-01-01'
        const expirationDate = actualModelYear + '-12-31'
        const refinedActivity = {
          ...activity,
          ...{
            modelYear: {
              name: actualModelYear,
              effectiveDate,
              expirationDate
            }
          }
        }
        complianceObligationDetails.push(refinedActivity)
      }
    }
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
  } = getComplianceObligationDetails(complianceObligationDetails, creditReductionSelection)

  const { provisionalBalance: prevProvisionalBalance, carryOverDeficits: prevCarryOverDeficits } = getComplianceObligationDetails(obligationDetails, creditReductionSelection)

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

  const creditReductionSelection =
    details.assessmentData && details.assessmentData.creditReductionSelection

  const transformedBalances = getNewBalancesStructure(prevProvisionalBalance)
  convertBalances(transformedBalances)

  const transformedNewBalances = getNewBalancesStructure(newBalances)
  convertBalances(transformedNewBalances)

  convertCarryOverDeficits(prevCarryOverDeficits)
  convertCarryOverDeficits(carryOverDeficits)

  const prevCreditReduction = calculateCreditReductionBig(
    transformedBalances,
    prevClassAReductions,
    prevUnspecifiedReductions,
    creditReductionSelection,
    prevCarryOverDeficits
  )
  const creditReduction = calculateCreditReductionBig(
    transformedNewBalances,
    classAReductions,
    unspecifiedReductions,
    creditReductionSelection,
    carryOverDeficits
  )
  const { deductions, balances, deficits } = creditReduction
  const prevDeductions = prevCreditReduction.deductions
  const updatedBalances = { balances, deficits }

  useEffect(() => {
    if (setReassessmentReductions) {
      setReassessmentReductions(constructReassessmentReductions(deductions, prevDeductions))
    }
  }, [deductions.length, prevDeductions.length])

  return (
    <div id="supplementary" className="page">
      <NoticeOfAssessmentSection
        name={supplierName}
        addresses={addresses}
        reassessmentServiceAddress={reassessmentServiceAddress}
        reassessmentRecordsAddress={reassessmentRecordsAddress}
        makes={makes}
        supplierClass={supplierClass}
        disabledInputs={false}
        modelYear={reportYear}
      />
      <br></br>
      <h3>Compliance Obligation</h3>
      <ComplianceObligationAmountsTable
        classAReductions={classAReductions}
        page={'assessment'}
        ratios={ratios}
        reportYear={Number(details.assessmentData.modelYear)}
        sales={sales || ldvSales}
        statuses={{ assessment: { status: 'ASSESSED' } }}
        supplierClass={supplierClass}
        totalReduction={totalReduction}
        unspecifiedReductions={unspecifiedReductions}
      />
      <div className="mt-4">
        <ComplianceObligationTableCreditsIssued
          pendingBalanceExist={false}
          reportYear={reportYear}
          reportDetails={reportDetails}
        />
      </div>
      <h3 className="mt-4 mb-2">Credit Reduction</h3>
      <ComplianceObligationReductionOffsetTable
        assessment={true}
        reportYear={reportYear}
        creditReductionSelection={creditReductionSelection}
        deductions={deductions}
        statuses={{ assessment: { status: 'ASSESSED' } }}
        supplierClass={supplierClass}
        updatedBalances={updatedBalances}
        user={user}
      />
    </div>
  )
}

export default ReassessmentDetailsPage
