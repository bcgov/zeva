import axios from 'axios'
import React, { useEffect, useState } from 'react'

import CreditTransactions from './components/CreditTransactions'
import Loading from '../app/components/Loading'
import CreditTransactionTabs from '../app/components/CreditTransactionTabs'
import ROUTES_CREDITS from '../app/routes/Credits'
import ROUTES_COMPLIANCE from '../app/routes/Compliance'
import CustomPropTypes from '../app/utilities/props'
import { getMostRecentModelYearReportId, getModelYearReportCreditBalances } from '../app/utilities/getModelYearReportCreditBalances'

const CreditsContainer = (props) => {
  const [loading, setLoading] = useState(true)
  const [balances, setBalances] = useState([])
  const [availableComplianceYears, setAvailableComplianceYears] = useState([])
  const [creditTransactions, setCreditTransactions] = useState([])
  const [reports, setReports] = useState([])
  const [assessedBalances, setAssessedBalances] = useState({})
  const { user } = props

  const getCreditTransactions = (complianceYear) => {
    return axios.get(ROUTES_CREDITS.LIST_BY_YEAR.replace(/:year/g, complianceYear))
  }

  const refreshList = (showLoading) => {
    setLoading(showLoading)
    const balancePromise = axios
      .get(ROUTES_CREDITS.RECENT_CREDIT_BALANCES)
      .then((response) => {
        setBalances(response.data)
      })

    const complianceYearsPromise = axios.get(ROUTES_CREDITS.COMPLIANCE_YEARS).then((response) => {
      const complianceYears = response.data
      complianceYears.sort((a, b) => { return (b - a) })
      setAvailableComplianceYears(response.data)
      if (complianceYears.length > 0) {
        return complianceYears[0]
      }
      return null
    }).then((complianceYear) => {
      if (complianceYear) {
        return getCreditTransactions(complianceYear)
      }
      return { data: [] }
    }).then((response) => {
      setCreditTransactions(response.data)
    })

    const reportsPromise = axios
      .get(ROUTES_COMPLIANCE.REPORTS)
      .then((response) => {
        setReports(response.data)
      })

    const assessedBalancesPromise = getMostRecentModelYearReportId(user.organization.id).then((modelYearReportId) => {
      return getModelYearReportCreditBalances(modelYearReportId)
    }).then((modelYearReportBalances) => {
      setAssessedBalances(modelYearReportBalances)
    })

    Promise.all([complianceYearsPromise, balancePromise, reportsPromise, assessedBalancesPromise]).then(() => {
      setLoading(false)
    })
  }

  const handleGetCreditTransactions = (complianceYear) => {
    getCreditTransactions(complianceYear).then((response) => {
      const updatedCreditTransactions = creditTransactions.concat(response.data)
      setCreditTransactions(updatedCreditTransactions)
    })
  }

  useEffect(() => {
    refreshList(true)
  }, [])

  if (loading) {
    return <Loading />
  }

  return (
    <div>
      <div>
        <CreditTransactionTabs
          active="credit-transactions"
          key="tabs"
          user={user}
        />
        <CreditTransactions
          availableComplianceYears={availableComplianceYears}
          balances={balances}
          assessedBalances={assessedBalances}
          items={creditTransactions}
          handleGetCreditTransactions={handleGetCreditTransactions}
          reports={reports}
          user={user}
        />
      </div>
    </div>
  )
}

CreditsContainer.propTypes = {
  user: CustomPropTypes.user.isRequired
}

export default CreditsContainer
