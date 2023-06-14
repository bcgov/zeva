/*
 * Container component
 * All data handling & manipulation should be handled here.
 */

import axios from 'axios'
import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useParams } from 'react-router-dom'
import { withRouter } from 'react-router'

import CustomPropTypes from '../app/utilities/props'
import ROUTES_ORGANIZATIONS from '../app/routes/Organizations'
import ROUTES_COMPLIANCE from '../app/routes/Compliance'
import VehicleSupplierTabs from '../app/components/VehicleSupplierTabs'
import VehicleSupplierSalesListPage from './components/VehicleSupplierSalesListPage'
import { getMostRecentModelYearReportId, getModelYearReportCreditBalances } from '../app/utilities/getModelYearReportCreditBalances'

const VehicleSupplierCreditTransactionListContainer = (props) => {
  const { id } = useParams()
  const [details, setDetails] = useState({})
  const [loading, setLoading] = useState(true)
  const [balances, setBalances] = useState({})
  const [assessedBalances, setAssessedBalances] = useState({})
  const [reports, setReports] = useState([])
  const [creditTransactions, setCreditTransactions] = useState([])
  const { keycloak, location, user } = props
  const { state: locationState } = location

  const refreshDetails = () => {
    setLoading(true)
    const balancePromise = axios
      .get(ROUTES_ORGANIZATIONS.SUPPLIER_BALANCE.replace(/:id/gi, id))
      .then((response) => {
        setBalances(response.data)
      })

    const listPromise = axios
      .get(ROUTES_ORGANIZATIONS.SUPPLIER_TRANSACTIONS.replace(/:id/gi, id))
      .then((response) => {
        setCreditTransactions(response.data)
      })

    const detailsPromise = axios
      .get(ROUTES_ORGANIZATIONS.DETAILS.replace(/:id/gi, id))
      .then((response) => {
        setDetails(response.data)
      })

    const reportsPromise = axios
      .get(ROUTES_COMPLIANCE.REPORTS)
      .then((response) => {
        setReports(response.data)
      })

      const assessedBalancesPromise = getMostRecentModelYearReportId(id).then((modelYearReportId) => {
        return getModelYearReportCreditBalances(modelYearReportId)
      }).then((modelYearReportBalances) => {
        setAssessedBalances(modelYearReportBalances)
      })

    Promise.all([
      balancePromise,
      listPromise,
      detailsPromise,
      reportsPromise,
      assessedBalancesPromise
    ]).then(() => {
      setLoading(false)
    })
  }

  useEffect(() => {
    refreshDetails()
  }, [keycloak.authenticated])

  return (
    <div className="page">
      <h1 className="mb-2">{details.name}</h1>
      <VehicleSupplierTabs
        locationState={locationState}
        supplierId={details.id}
        active="supplier-credit-transactions"
        user={user}
      />
      <VehicleSupplierSalesListPage
        loading={loading}
        locationState={locationState}
        balances={balances}
        assessedBalances={assessedBalances}
        items={creditTransactions}
        reports={reports}
        user={{ isGovernment: true }}
      />
    </div>
  )
}
VehicleSupplierCreditTransactionListContainer.propTypes = {
  keycloak: CustomPropTypes.keycloak.isRequired,
  location: PropTypes.shape().isRequired,
  user: CustomPropTypes.user.isRequired
}

export default withRouter(VehicleSupplierCreditTransactionListContainer)
