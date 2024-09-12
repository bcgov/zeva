import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ROUTES_CREDITS from '../routes/Credits'
import { getMostRecentModelYearReportBalances, getPostRecentModelYearReportBalances } from '../utilities/getModelYearReportCreditBalances'
import calculateCreditBalance from '../utilities/calculateCreditBalance'
import formatNumeric from '../utilities/formatNumeric'

const CreditBalanceHeader = (props) => {
  const { organization } = props
  const [loading, setLoading] = useState(true)
  const [balances, setBalances] = useState([])
  const [assessedBalances, setAssessedBalances] = useState({})

  useEffect(() => {
    getMostRecentModelYearReportBalances(organization.id).then((assessedBalances) => {
      setAssessedBalances(assessedBalances)
      return getPostRecentModelYearReportBalances()
    }).then((balances) => {
      setBalances(balances)
      setLoading(false)
    })
  }, [])

  const { deficitAExists, deficitBExists, totalCredits } = calculateCreditBalance(balances, assessedBalances)

  let content
  if (loading) {
    content = 'Loading Credit Balance...'
  } else if (deficitAExists || deficitBExists) {
    content = 'Deficit'
  } else {
    content = `Credit Balance: A-
        ${formatNumeric(totalCredits['Total Current ZEV Credits'].A, 2, true)}/ B-
        ${formatNumeric(totalCredits['Total Current ZEV Credits'].B, 2, true)}`
  }
  return (
    <Link
      className="credit-balance d-print-none"
      to={ROUTES_CREDITS.LIST}
    >
      {content}
    </Link>
  )
}

export default CreditBalanceHeader
