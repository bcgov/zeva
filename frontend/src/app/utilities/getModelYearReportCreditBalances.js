import axios from 'axios'
import Big from 'big.js'
import ROUTES_COMPLIANCE from '../routes/Compliance'
import ROUTES_ORGANIZATIONS from '../routes/Organizations'
import ROUTES_CREDITS from '../routes/Credits'
import getComplianceObligationDetails from './getComplianceObligationDetails'
import getClassAReductionBig from './getClassAReductionBig'
import getUnspecifiedClassReductionBig from './getUnspecifiedClassReductionBig'
import calculateCreditReductionBig from './calculateCreditReductionBig'
import { convertBalances, convertCarryOverDeficits } from './convertToBig'

const getMostRecentReportId = (organizationId) => {
  return axios.get(ROUTES_ORGANIZATIONS.MOST_RECENT_MYR_ID.replace(/:id/g, organizationId)).then((response) => {
    return response.data
  })
}

const getModelYearReportCreditBalances = (modelYearReportId) => {
  if (!modelYearReportId) {
    return {}
  }
  return axios.all([
    axios.get(ROUTES_COMPLIANCE.REPORT_DETAILS.replace(/:id/g, modelYearReportId)),
    axios.get(ROUTES_COMPLIANCE.RATIOS),
    axios.get(
          `${ROUTES_COMPLIANCE.REPORT_COMPLIANCE_DETAILS_BY_ID.replace(
            ':id',
            modelYearReportId
          )}?assessment=True`
    )
  ]).then(axios.spread((reportDetailsResponse, ratioResponse, creditActivityResponse) => {
    const complianceResponseDetails = creditActivityResponse.data.complianceObligation

    const {
      provisionalBalance,
      carryOverDeficits
    } = getComplianceObligationDetails(complianceResponseDetails, creditReductionSelection)

    const {
      modelYear,
      ldvSales,
      supplierClass: tempSupplierClass,
      creditReductionSelection
    } = reportDetailsResponse.data

    // tempBalances:

    const tempBalances = []

    Object.keys(provisionalBalance).forEach((year) => {
      const { A: creditA, B: creditB } = provisionalBalance[year]
      tempBalances.push({
        modelYear: Number(year),
        creditA,
        creditB
      })
    })

    convertBalances(tempBalances)
    convertCarryOverDeficits(carryOverDeficits)

    const currentReportYear = Number(modelYear.name)

    const filteredRatios = ratioResponse.data.find(
      (data) => Number(data.modelYear) === Number(currentReportYear)
    )

    const classAReduction = getClassAReductionBig(
      ldvSales,
      filteredRatios.zevClassA,
      tempSupplierClass
    )

    const tempClassAReductions = [
      {
        modelYear: Number(modelYear.name),
        value: new Big(classAReduction.toFixed(2))
      }
    ]

    const leftoverReduction = getUnspecifiedClassReductionBig(
      ldvSales,
      filteredRatios.complianceRatio,
      filteredRatios.zevClassA,
      tempSupplierClass
    )

    const tempUnspecifiedReductions = [
      {
        modelYear: Number(modelYear.name),
        value: new Big(leftoverReduction.toFixed(2))
      }
    ]

    const creditReduction = calculateCreditReductionBig(
      tempBalances,
      tempClassAReductions,
      tempUnspecifiedReductions,
      creditReductionSelection,
      carryOverDeficits
    )

    return {
      balances: creditReduction.balances,
      deficits: creditReduction.deficits
    }
  }))
}

const getSupplementalCreditActivity = (supplementalId) => {
  if (!supplementalId) {
    return {}
  }
  return axios.get(ROUTES_COMPLIANCE.SUPPLEMENTAL_CREDIT_ACTIVITY.replace(/:supp_id/g, supplementalId)).then((response) => {
    const balances = []
    const deficits = []
    const creditActivities = response.data
    for (const creditActivity of creditActivities) {
      const category = creditActivity.category
      if (category === 'ProvisionalBalanceAfterCreditReduction') {
        balances.push({
          modelYear: creditActivity.modelYear.name,
          creditA: creditActivity.creditAValue,
          creditB: creditActivity.creditBValue
        })
      }
      // todo: handle deficits (need to find out the category key for deficits...)
    }
    return {
      balances: balances,
      deficits: deficits
    }
  })
}

const getMostRecentReportBalances = (organizationId) => {
  return getMostRecentReportId(organizationId).then((data) => {
    const id = data.id
    if (data.isSupplementary) {
      return getSupplementalCreditActivity(id)
    }
    return getModelYearReportCreditBalances(id)
  }).then((reportBalances) => {
    return reportBalances
  })
}

const getPostRecentReportBalances = (organizationId) => {
  if (organizationId) {
    return axios.get(ROUTES_ORGANIZATIONS.RECENT_SUPPLIER_BALANCE.replace(/:id/g, organizationId)).then((response) => {
      return response.data
    })
  }
  return axios.get(ROUTES_CREDITS.RECENT_CREDIT_BALANCES).then((response) => {
    return response.data
  })
}

export { getMostRecentReportBalances, getPostRecentReportBalances }
