/*
 * Container component
 * All data handling & manipulation should be handled here.
 */
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { withRouter } from 'react-router'
import CreditTransactionTabs from '../app/components/CreditTransactionTabs'
import ROUTES_CREDIT_REQUESTS from '../app/routes/CreditRequests'
import CustomPropTypes from '../app/utilities/props'
import CreditRequestsPage from './components/CreditRequestsPage'

const CreditRequestListContainer = (props) => {
  const { location, user } = props
  const [loading, setLoading] = useState(true)
  const [submissions, setSubmissions] = useState([])
  const [page, setPage] = useState(location && location.state && location.state.page ? location.state.page : 1)
  const [pageSize, setPageSize] = useState(location && location.state && location.state.pageSize ? location.state.pageSize : 10)
  const [filters, setFilters] = useState(location && location.state && location.state.filters ? location.state.filters : [])
  const [sorts, setSorts] = useState(location && location.state && location.state.sorts ? location.state.sorts : [])
  const [submissionsCount, setSubmissionsCount] = useState(0)

  const handleClear = () => {
    setFilters([])
    setSorts([])
    setPage(1)
  }

  const refreshList = () => {
    setLoading(true)

    const url = `${ROUTES_CREDIT_REQUESTS.LIST_PAGINATED}?page=${page}&size=${pageSize}`
    const data = {
      filters,
      sorts
    }

    axios.post(url, data).then((response) => {
      setSubmissions(response.data.results)
      setSubmissionsCount(response.data.count)
      setLoading(false)
    })
  }

  useEffect(() => {
    refreshList()
  }, [page, pageSize, filters, sorts])

  return [
    <CreditTransactionTabs active="credit-requests" key="tabs" user={user} />,
    <CreditRequestsPage
      handleClear={handleClear}
      key="page"
      page={page}
      setPage={setPage}
      pageSize={pageSize}
      setPageSize={setPageSize}
      filters={filters}
      setFilters={setFilters}
      sorts={sorts}
      setSorts={setSorts}
      submissions={submissions}
      submissionsCount={submissionsCount}
      loading={loading}
      user={user}
    />
  ]
}

CreditRequestListContainer.propTypes = {
  user: CustomPropTypes.user.isRequired
}

export default withRouter(CreditRequestListContainer)
