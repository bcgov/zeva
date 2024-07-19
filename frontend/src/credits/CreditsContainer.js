import axios from 'axios'
import React, { useEffect, useState } from 'react'

import CreditTransactions from './components/CreditTransactions'
import Loading from '../app/components/Loading'
import CreditTransactionTabs from '../app/components/CreditTransactionTabs'
import ROUTES_CREDITS from '../app/routes/Credits'
import ROUTES_COMPLIANCE from '../app/routes/Compliance'
import ROUTES_ORGANIZATION from '../app/routes/Organizations'
import CustomPropTypes from '../app/utilities/props'
import { getMostRecentModelYearReportBalances, getPostRecentModelYearReportBalances, getBackdatedTransactions } from '../app/utilities/getModelYearReportCreditBalances'

const CreditsContainer = (props) => {
  const [loading, setLoading] = useState(true)
  const [balances, setBalances] = useState([])
  const [availableComplianceYears, setAvailableComplianceYears] = useState([])
  const [creditTransactions, setCreditTransactions] = useState([])
  const [reports, setReports] = useState([])
  const [assessedSupplementalsMap, setAssessedSupplementalsMap] = useState({})
  const [assessedBalances, setAssessedBalances] = useState({})
  const [backdatedTransactions, setBackdatedTransactions] = useState([])
  const { user } = props

  const getCreditTransactions = (complianceYear) => {
    return axios.get(ROUTES_CREDITS.LIST_BY_YEAR.replace(/:year/g, complianceYear))
  }

  const refreshList = (showLoading) => {
    setLoading(showLoading)
    const balancePromise = getPostRecentModelYearReportBalances().then((balances) => {
      setBalances(balances)
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

    const assessedSupplementalsMapPromise = axios
      .get(ROUTES_ORGANIZATION.ASSESSED_SUPPLEMENTALS_MAP.replace(/:id/gi, user.organization.id))
      .then((response) => {
        setAssessedSupplementalsMap(response.data)
      })

    const assessedBalancesPromise = getMostRecentModelYearReportBalances(user.organization.id).then((assessedBalances) => {
      setAssessedBalances(assessedBalances)
    })

    const backdatedTransactionsPromise = getBackdatedTransactions(user.organization.id).then((transactions) => {
      setBackdatedTransactions(transactions)
    })

    Promise.all([complianceYearsPromise, balancePromise, reportsPromise, assessedBalancesPromise, assessedSupplementalsMapPromise, backdatedTransactionsPromise]).then(() => {
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
          assessedSupplementalsMap={assessedSupplementalsMap}
          availableComplianceYears={availableComplianceYears}
          backdatedTransactions={backdatedTransactions}
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
