// intended only for directors to view an assessed reassessment

import React, { useEffect } from 'react'
import calculateCreditReduction from '../../app/utilities/calculateCreditReduction'
import getClassAReduction from '../../app/utilities/getClassAReduction'
import getComplianceObligationDetails from '../../app/utilities/getComplianceObligationDetails'
import getTotalReduction from '../../app/utilities/getTotalReduction'
import getUnspecifiedClassReduction from '../../app/utilities/getUnspecifiedClassReduction'
import ComplianceObligationAmountsTable from '../../compliance/components/ComplianceObligationAmountsTable'
import ComplianceObligationReductionOffsetTable from '../../compliance/components/ComplianceObligationReductionOffsetTable'
import ComplianceObligationTableCreditsIssued from '../../compliance/components/ComplianceObligationTableCreditsIssued'
import NoticeOfAssessmentSection from '../../compliance/components/NoticeOfAssessmentSection'
import constructReassessmentReductions from '../../app/utilities/constructReassessmentReductions'

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

  let classAReductionValue = getClassAReduction(
    ldvSales,
    ratios.zevClassA,
    supplierClass
  )
  const prevClassAReductionValue = classAReductionValue
  if (newData && newData.supplierInfo && newData.supplierInfo.ldvSales) {
    classAReductionValue = getClassAReduction(
      newData.supplierInfo.ldvSales,
      ratios.zevClassA,
      supplierClass
    )
  }

  const prevClassAReductions = [
    {
      modelYear: reportYear,
      value: prevClassAReductionValue
    }
  ]

  const classAReductions = [
    {
      modelYear: reportYear,
      value: classAReductionValue
    }
  ]

  let sales = details.ldvSales
  if (newData && newData.supplierInfo && newData.supplierInfo.ldvSales) {
    sales = newData.supplierInfo.ldvSales
  }

  let totalReduction = getTotalReduction(ldvSales, ratios.complianceRatio)
  const prevTotalReduction = totalReduction
  if (newData && newData.supplierInfo && newData.supplierInfo.ldvSales) {
    totalReduction = getTotalReduction(
      newData.supplierInfo.ldvSales,
      ratios.complianceRatio
    )
  }

  const prevUnspecifiedReductionValue = getUnspecifiedClassReduction(
    prevTotalReduction,
    prevClassAReductionValue
  )

  const unspecifiedReductionValue = getUnspecifiedClassReduction(
    totalReduction,
    classAReductionValue
  )

  const prevUnspecifiedReductions = [
    {
      modelYear: reportYear,
      value: prevUnspecifiedReductionValue
    }
  ]

  const unspecifiedReductions = [
    {
      modelYear: reportYear,
      value: unspecifiedReductionValue
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
    automaticAdministrativePenalty
  } = getComplianceObligationDetails(complianceObligationDetails)

  const prevProvisionalBalance = getComplianceObligationDetails(obligationDetails, creditReductionSelection).provisionalBalance

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

  const transformedBalances = []
  Object.keys(prevProvisionalBalance).forEach((year) => {
    const { A: creditA, B: creditB } = prevProvisionalBalance[year]
    transformedBalances.push({
      modelYear: Number(year),
      creditA,
      creditB
    })
  })

  const transformedNewBalances = []
  Object.keys(newBalances).forEach((year) => {
    const { A: creditA, B: creditB } = newBalances[year]
    transformedNewBalances.push({
      modelYear: Number(year),
      creditA,
      creditB
    })
  })

  const prevCreditReduction = calculateCreditReduction(
    transformedBalances,
    prevClassAReductions,
    prevUnspecifiedReductions,
    creditReductionSelection
  )
  const creditReduction = calculateCreditReduction(
    transformedNewBalances,
    classAReductions,
    unspecifiedReductions,
    creditReductionSelection
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
