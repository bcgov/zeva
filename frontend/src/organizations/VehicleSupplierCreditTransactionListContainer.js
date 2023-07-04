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
  const [balances, setBalances] = useState([])
  const [availableComplianceYears, setAvailableComplianceYears] = useState([])
  const [assessedBalances, setAssessedBalances] = useState({})
  const [reports, setReports] = useState([])
  const [creditTransactions, setCreditTransactions] = useState([])
  const { keycloak, location, user } = props
  const { state: locationState } = location

  const getCreditTransactions = (complianceYear) => {
    return axios.get(ROUTES_ORGANIZATIONS.LIST_BY_YEAR.replace(/:id/g, id).replace(/:year/g, complianceYear))
  }

  const refreshDetails = () => {
    setLoading(true)
    const balancePromise = axios
      .get(ROUTES_ORGANIZATIONS.RECENT_SUPPLIER_BALANCE.replace(/:id/g, id))
      .then((response) => {
        setBalances(response.data)
      })

    const complianceYearsPromise = axios.get(ROUTES_ORGANIZATIONS.COMPLIANCE_YEARS.replace(/:id/g, id)).then((response) => {
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
      complianceYearsPromise,
      detailsPromise,
      reportsPromise,
      assessedBalancesPromise
    ]).then(() => {
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
        availableComplianceYears={availableComplianceYears}
        loading={loading}
        locationState={locationState}
        balances={balances}
        assessedBalances={assessedBalances}
        items={creditTransactions}
        handleGetCreditTransactions={handleGetCreditTransactions}
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
