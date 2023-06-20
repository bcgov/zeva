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
  const [balances, setBalances] = useState({})
  const [creditTransactions, setCreditTransactions] = useState([])
  const [reports, setReports] = useState([])
  const [assessedBalances, setAssessedBalances] = useState({})
  const { user } = props

  const refreshList = (showLoading) => {
    setLoading(showLoading)
    const balancePromise = axios
      .get(ROUTES_CREDITS.CREDIT_BALANCES)
      .then((response) => {
        setBalances(response.data)
      })

    const listPromise = axios.get(ROUTES_CREDITS.LIST).then((response) => {
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

    Promise.all([balancePromise, listPromise, reportsPromise, assessedBalancesPromise]).then(() => {
      setLoading(false)
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
          balances={balances}
          assessedBalances={assessedBalances}
          items={creditTransactions}
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
