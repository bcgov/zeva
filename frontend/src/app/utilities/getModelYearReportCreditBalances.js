import axios from 'axios'
import ROUTES_COMPLIANCE from '../routes/Compliance'
import ROUTES_ORGANIZATIONS from '../routes/Organizations'
import ROUTES_CREDITS from '../routes/Credits'
import getComplianceObligationDetails from './getComplianceObligationDetails'
import getClassAReduction from './getClassAReduction'
import getTotalReduction from './getTotalReduction'
import getUnspecifiedClassReduction from './getUnspecifiedClassReduction'
import calculateCreditReduction from './calculateCreditReduction'

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
      provisionalBalance
    } = getComplianceObligationDetails(complianceResponseDetails)

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

    // tempClassAReductions:

    const currentReportYear = Number(modelYear.name)

    const filteredRatios = ratioResponse.data.find(
      (data) => Number(data.modelYear) === Number(currentReportYear)
    )

    const classAReduction = getClassAReduction(
      ldvSales,
      filteredRatios.zevClassA,
      tempSupplierClass
    )

    const tempClassAReductions = [
      {
        modelYear: Number(modelYear.name),
        value: Number(classAReduction)
      }
    ]

    // tempUnspecifiedReductions:

    const tempTotalReduction = getTotalReduction(
      ldvSales,
      filteredRatios.complianceRatio
    )

    const leftoverReduction = getUnspecifiedClassReduction(
      tempTotalReduction,
      classAReduction
    )

    const tempUnspecifiedReductions = [
      {
        modelYear: Number(modelYear.name),
        value: Number(leftoverReduction)
      }
    ]

    const creditReduction = calculateCreditReduction(
      tempBalances,
      tempClassAReductions,
      tempUnspecifiedReductions,
      creditReductionSelection
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
