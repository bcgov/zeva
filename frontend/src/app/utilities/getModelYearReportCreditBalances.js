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

const getMostRecentModelYearReportId = (organizationId) => {
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

const getMostRecentModelYearReportBalances = (organizationId) => {
  return getMostRecentModelYearReportId(organizationId).then((modelYearReportId) => {
    return getModelYearReportCreditBalances(modelYearReportId)
  }).then((modelYearReportBalances) => {
    return modelYearReportBalances
  })
}

const getPostRecentModelYearReportBalances = (organizationId) => {
  if (organizationId) {
    return axios.get(ROUTES_ORGANIZATIONS.RECENT_SUPPLIER_BALANCE.replace(/:id/g, organizationId)).then((response) => {
      return response.data
    })
  }
  return axios.get(ROUTES_CREDITS.RECENT_CREDIT_BALANCES).then((response) => {
    return response.data
  })
}

export { getMostRecentModelYearReportId, getModelYearReportCreditBalances, getMostRecentModelYearReportBalances, getPostRecentModelYearReportBalances }
